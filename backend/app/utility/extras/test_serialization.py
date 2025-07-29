#!/usr/bin/env python3
"""
Test script to verify that the serialize_for_json function works correctly
with datetime objects and other non-JSON-serializable types.
"""

import sys
import os
from datetime import date, datetime
import numpy as np
import json

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utility.spark_services import serialize_for_json

def test_serialize_for_json():
    """Test the serialize_for_json function with various data types."""
    
    # Test data with datetime objects
    test_data = {
        "numRows": 1000,
        "numColumns": 5,
        "columnStats": [
            {
                "name": "date_column",
                "type": "DateType()",
                "entries": 1000,
                "nullCount": 0,
                "uniqueCount": 365,
                "topCategories": [
                    {
                        "value": date(2022, 10, 9),  # This is a datetime.date object
                        "count": 10
                    },
                    {
                        "value": date(2022, 10, 10),
                        "count": 8
                    }
                ]
            },
            {
                "name": "timestamp_column",
                "type": "TimestampType()",
                "entries": 1000,
                "nullCount": 0,
                "uniqueCount": 1000,
                "topCategories": [
                    {
                        "value": datetime(2022, 10, 9, 14, 30, 0),  # This is a datetime.datetime object
                        "count": 5
                    }
                ]
            }
        ],
        "datasetHead": [
            {
                "id": 1,
                "name": "John Doe",
                "birth_date": date(1990, 5, 15),
                "created_at": datetime(2022, 10, 9, 10, 30, 0),
                "score": 95.5
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "birth_date": date(1985, 8, 22),
                "created_at": datetime(2022, 10, 9, 11, 45, 0),
                "score": 87.2
            }
        ]
    }
    
    print("Original data structure:")
    print(f"Type of birth_date: {type(test_data['datasetHead'][0]['birth_date'])}")
    print(f"Type of created_at: {type(test_data['datasetHead'][0]['created_at'])}")
    print(f"Type of score: {type(test_data['datasetHead'][0]['score'])}")
    print()
    
    # Test serialization
    try:
        serialized_data = serialize_for_json(test_data)
        print("Serialization successful!")
        print(f"Type of birth_date after serialization: {type(serialized_data['datasetHead'][0]['birth_date'])}")
        print(f"Type of created_at after serialization: {type(serialized_data['datasetHead'][0]['created_at'])}")
        print(f"Type of score after serialization: {type(serialized_data['datasetHead'][0]['score'])}")
        print()
        
        # Test JSON serialization
        json_string = json.dumps(serialized_data, indent=2)
        print("JSON serialization successful!")
        print("Sample of serialized data:")
        print(json_string[:500] + "...")
        print()
        
        # Test deserialization
        deserialized_data = json.loads(json_string)
        print("JSON deserialization successful!")
        print(f"Birth date value: {deserialized_data['datasetHead'][0]['birth_date']}")
        print(f"Created at value: {deserialized_data['datasetHead'][0]['created_at']}")
        
        return True
        
    except Exception as e:
        print(f"Error during serialization: {e}")
        return False

if __name__ == "__main__":
    print("Testing serialize_for_json function...")
    success = test_serialize_for_json()
    
    if success:
        print("\n✅ All tests passed! The serialization function works correctly.")
    else:
        print("\n❌ Tests failed! There are issues with the serialization function.")
        sys.exit(1)