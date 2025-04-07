import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pymongo
from bson import ObjectId
import joblib
import os
from sklearn.preprocessing import StandardScaler
from collections import defaultdict

class BlogRecommendationEngine:
    def __init__(self, mongo_uri="mongodb://localhost:27017/", db_name="your_db_name"):
        """Initialize the recommendation engine with MongoDB connection."""
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client[db_name]
        
        # Learning parameters
        self.alpha = 0.1  # Learning rate
        self.gamma = 0.6  # Discount factor
        self.epsilon = 0.1  # Exploration rate
        
        # Path to save the Q-table
        self.q_table_path = "model/blog_q_table.pkl"
        
        # Load existing Q-table if available
        if os.path.exists(self.q_table_path):
            self.q_table = joblib.load(self.q_table_path)
        else:
            # Initialize empty Q-table as a defaultdict of defaultdicts
            self.q_table = defaultdict(lambda: defaultdict(float))
    
    def _calculate_engagement_score(self, time_spent_seconds):
        """Calculate engagement score based on time spent reading."""
        if time_spent_seconds < 10:  # Less than 10 seconds - probably not interested
            return 0.1
        elif time_spent_seconds < 30:  # Brief look
            return 0.3
        elif time_spent_seconds < 60:  # Quick read
            return 0.5
        elif time_spent_seconds < 180:  # Average read
            return 0.7
        elif time_spent_seconds < 300:  # Engaged read
            return 0.9
        else:  # Very engaged
            return 1.0
    
    def _get_state(self, user_email):
        """Get user's current state based on recent behavior."""
        # Fetch user's recent clicks
        recent_clicks = list(self.db.UserClicks.find(
            {"user_email": user_email, "exited_at": {"$exists": True}},
            sort=[("clicked_at", -1)],
            limit=5
        ))
        
        # If no recent clicks, return a default state
        if not recent_clicks:
            return "new_user"
        
        # Calculate engagement metrics
        total_engagement = 0
        doctor_counts = defaultdict(int)
        specialty_counts = defaultdict(int)
        hospital_counts = defaultdict(int)
        
        for click in recent_clicks:
            if click.get("exited_at"):
                # Calculate time spent in seconds
                clicked_at = click.get("clicked_at")
                exited_at = click.get("exited_at")
                
                if clicked_at and exited_at:
                    time_spent = (exited_at - clicked_at).total_seconds()
                    engagement_score = self._calculate_engagement_score(time_spent)
                    total_engagement += engagement_score
                    
                    # Get blog details to update preferences
                    blog = self.db.blogs.find_one({"_id": click.get("blog_id")})
                    if blog:
                        doctor_email = blog.get("doctor_email")
                        
                        # Get doctor details
                        doctor = self.db.doctors.find_one({"email": doctor_email})
                        if doctor:
                            doctor_counts[doctor_email] += engagement_score
                            specialty_counts[doctor.get("specialty", "Unknown")] += engagement_score
                            hospital_counts[doctor.get("hospital", "Unknown")] += engagement_score
        
        # Determine primary interest
        if not doctor_counts and not specialty_counts and not hospital_counts:
            return "new_user"
        
        # Find the highest interest area
        max_doctor = max(doctor_counts.items(), key=lambda x: x[1], default=(None, 0))
        max_specialty = max(specialty_counts.items(), key=lambda x: x[1], default=(None, 0))
        max_hospital = max(hospital_counts.items(), key=lambda x: x[1], default=(None, 0))
        
        # Return the highest scoring preference as state
        if max_doctor[1] >= max(max_specialty[1], max_hospital[1]):
            return f"doctor:{max_doctor[0]}"
        elif max_specialty[1] >= max_hospital[1]:
            return f"specialty:{max_specialty[0]}"
        else:
            return f"hospital:{max_hospital[0]}"
    
    def _get_actions(self, user_email, state):
        """Get possible actions (blogs to recommend) based on state."""
        # Get all available blogs
        all_blogs = list(self.db.blogs.find())
        
        # Filter blogs based on state preference
        if state.startswith("doctor:"):
            doctor_email = state.split(":", 1)[1]
            filtered_blogs = [blog for blog in all_blogs if blog.get("doctor_email") == doctor_email]
        elif state.startswith("specialty:"):
            specialty = state.split(":", 1)[1]
            # Need to get doctors with this specialty
            doctors = list(self.db.doctors.find({"specialty": specialty}))
            doctor_emails = [doctor.get("email") for doctor in doctors]
            filtered_blogs = [blog for blog in all_blogs if blog.get("doctor_email") in doctor_emails]
        elif state.startswith("hospital:"):
            hospital = state.split(":", 1)[1]
            # Need to get doctors from this hospital
            doctors = list(self.db.doctors.find({"hospital": hospital}))
            doctor_emails = [doctor.get("email") for doctor in doctors]
            filtered_blogs = [blog for blog in all_blogs if blog.get("doctor_email") in doctor_emails]
        else:
            # New user or unknown state - use all blogs
            filtered_blogs = all_blogs
        
        # If no blogs match the filter, use all blogs
        if not filtered_blogs:
            filtered_blogs = all_blogs
            
        # Convert blogs to action format (blog_id strings)
        return [str(blog.get("_id")) for blog in filtered_blogs]
    
    def _select_action(self, state, actions):
        """Select an action using epsilon-greedy policy."""
        if np.random.random() < self.epsilon:
            # Exploration: choose a random action
            return np.random.choice(actions) if actions else None
        else:
            # Exploitation: choose the best known action
            if not actions:
                return None
                
            # Get Q-values for this state
            q_values = {action: self.q_table[state][action] for action in actions}
            
            # Find maximum Q-value
            max_q = max(q_values.values()) if q_values else 0
            
            # Get all actions with the maximum Q-value
            best_actions = [action for action, q_value in q_values.items() 
                           if q_value == max_q]
            
            # Randomly select from best actions (to break ties)
            return np.random.choice(best_actions)
    
    def _get_reward(self, user_email, blog_id):
        """Calculate reward based on user's engagement with the blog."""
        # Get the most recent click for this user and blog
        click = self.db.UserClicks.find_one(
            {"user_email": user_email, "blog_id": ObjectId(blog_id), "exited_at": {"$exists": True}},
            sort=[("clicked_at", -1)]
        )
        
        if not click or not click.get("exited_at"):
            return 0  # No engagement recorded
        
        # Calculate time spent reading
        clicked_at = click.get("clicked_at")
        exited_at = click.get("exited_at")
        
        if not clicked_at or not exited_at:
            return 0
            
        time_spent = (exited_at - clicked_at).total_seconds()
        
        # Calculate engagement score
        return self._calculate_engagement_score(time_spent)
    
    def update_q_table(self, user_email):
        """Update Q-table based on user's recent interactions."""
        # Get recent clicks with exit times (completed readings)
        recent_clicks = list(self.db.UserClicks.find(
            {"user_email": user_email, "exited_at": {"$exists": True}},
            sort=[("clicked_at", -1)],
            limit=10
        ))
        
        if not recent_clicks:
            return  # No data to learn from
        
        for click in recent_clicks:
            blog_id = str(click.get("blog_id"))
            
            # Get the state before this action
            state = self._get_state(user_email)
            
            # Get the reward for this action
            reward = self._get_reward(user_email, blog_id)
            
            # Get possible next actions
            next_state = self._get_state(user_email)  # State may have changed after the action
            next_actions = self._get_actions(user_email, next_state)
            
            # Get maximum Q-value for next state
            max_next_q = max([self.q_table[next_state][next_action] for next_action in next_actions]) if next_actions else 0
            
            # Update Q-value using Q-learning formula
            self.q_table[state][blog_id] = (1 - self.alpha) * self.q_table[state][blog_id] + \
                                          self.alpha * (reward + self.gamma * max_next_q)
        
        # Save updated Q-table
        joblib.dump(dict(self.q_table), self.q_table_path)
    
    def get_recommendations(self, user_email, limit=5):
        """Get blog recommendations for a user."""
        # Update Q-table with latest user interactions
        self.update_q_table(user_email)
        
        # Get user's current state
        state = self._get_state(user_email)
        
        # Get possible actions
        actions = self._get_actions(user_email, state)
        
        # Get recommendations
        recommendations = []
        for _ in range(min(limit, len(actions))):
            # Select an action
            action = self._select_action(state, actions)
            if not action:
                break
                
            # Add to recommendations
            recommendations.append(ObjectId(action))
            
            # Remove this action from available actions to avoid duplicates
            actions.remove(action)
        
        # Fetch blog details for recommendations
        recommended_blogs = []
        for blog_id in recommendations:
            blog = self.db.blogs.find_one({"_id": blog_id})
            if blog:
                # Get doctor details
                doctor = self.db.doctors.find_one({"email": blog.get("doctor_email")})
                
                recommended_blogs.append({
                    "_id": str(blog.get("_id")),
                    "title": blog.get("title"),
                    "doctor_name": blog.get("doctor_name"),
                    "doctor_email": blog.get("doctor_email"),
                    "specialty": doctor.get("specialty") if doctor else "Unknown",
                    "hospital": doctor.get("hospital") if doctor else "Unknown"
                })
        
        # Update user's recommendation document
        self.db.Recommendations.update_one(
            {"user_email": user_email},
            {
                "$set": {
                    "blog_recommendations": [
                        {"blog_id": ObjectId(blog["_id"]), "score": self.q_table[state][blog["_id"]]} 
                        for blog in recommended_blogs
                    ],
                    "last_updated": datetime.now()
                }
            },
            upsert=True
        )
        
        return recommended_blogs
    
    def get_category_recommendations(self, user_email, category_type, limit=3):
        """Get recommendations for a specific category (doctor, specialty, hospital)."""
        # Update Q-table with latest user interactions
        self.update_q_table(user_email)
        
        # Get user's recent clicks
        recent_clicks = list(self.db.UserClicks.find(
            {"user_email": user_email, "exited_at": {"$exists": True}},
            sort=[("clicked_at", -1)],
            limit=20
        ))
        
        # Calculate scores for each category
        scores = defaultdict(float)
        
        for click in recent_clicks:
            blog_id = click.get("blog_id")
            blog = self.db.blogs.find_one({"_id": blog_id})
            
            if not blog:
                continue
                
            doctor_email = blog.get("doctor_email")
            doctor = self.db.doctors.find_one({"email": doctor_email})
            
            if not doctor:
                continue
                
            # Calculate engagement score
            if click.get("exited_at") and click.get("clicked_at"):
                time_spent = (click["exited_at"] - click["clicked_at"]).total_seconds()
                score = self._calculate_engagement_score(time_spent)
                
                if category_type == "doctor":
                    scores[doctor_email] += score
                elif category_type == "specialty":
                    scores[doctor.get("specialty", "Unknown")] += score
                elif category_type == "hospital":
                    scores[doctor.get("hospital", "Unknown")] += score
        
        # Get top categories
        top_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        # Update user's preferences
        if category_type == "doctor":
            self.db.Recommendations.update_one(
                {"user_email": user_email},
                {
                    "$set": {
                        "doctor_preferences": [
                            {"doctor_email": cat, "score": score} 
                            for cat, score in top_categories
                        ],
                        "last_updated": datetime.now()
                    }
                },
                upsert=True
            )
        elif category_type == "specialty":
            self.db.Recommendations.update_one(
                {"user_email": user_email},
                {
                    "$set": {
                        "specialty_preferences": [
                            {"specialty": cat, "score": score} 
                            for cat, score in top_categories
                        ],
                        "last_updated": datetime.now()
                    }
                },
                upsert=True
            )
        elif category_type == "hospital":
            self.db.Recommendations.update_one(
                {"user_email": user_email},
                {
                    "$set": {
                        "hospital_preferences": [
                            {"hospital": cat, "score": score} 
                            for cat, score in top_categories
                        ],
                        "last_updated": datetime.now()
                    }
                },
                upsert=True
            )
        
        return [{"category": cat, "score": score} for cat, score in top_categories]