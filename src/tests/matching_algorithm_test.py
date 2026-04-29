#!/usr/bin/env python3
"""
Matching Algorithm Test (Python)
Tests weighted Jaccard + boosts + randomization

Run: python src/tests/matching_algorithm_test.py
"""

import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional

#  Interest frequency data 
# In production, precomputed by MatchingService.precomputeInterestFrequencies()
INTEREST_FREQUENCIES = {
    "coding": 50,
    "hiking": 30,
    "music": 80,
    "chess": 10,
    "coffee": 25,
    "gaming": 40,
    "art": 15,
    "reading": 20,
    "basketball": 12,
}

def get_interest_weight(interest: str) -> float:
    """IDF weighting: 1 / log(frequency + 1)"""
    freq = INTEREST_FREQUENCIES.get(interest, 1)
    return 1 / math.log(freq + 1)


def weighted_jaccard(a: List[str], b: List[str]) -> float:
    """Weighted Jaccard similarity (0-1)"""
    if not a or not b:
        return 0.0
    
    set_a, set_b = set(a), set(b)
    union = set_a | set_b
    
    intersection_weight = sum(get_interest_weight(i) for i in (set_a & set_b))
    union_weight = sum(get_interest_weight(i) for i in union)
    
    return intersection_weight / union_weight if union_weight > 0 else 0.0


def dorm_boost(dorm_a: Optional[str], dorm_b: Optional[str]) -> float:
    """+0.15 same building, +0.05 same complex, 0 otherwise"""
    if not dorm_a or not dorm_b:
        return 0.0
    
    d_a, d_b = dorm_a.lower().strip(), dorm_b.lower().strip()
    if d_a == d_b:
        return 0.15
    
    # Partial match (same complex)
    words_a = d_a.split()
    words_b = d_b.split()
    for wa in words_a:
        for wb in words_b:
            if wa == wb and len(wa) > 3:
                return 0.05
    return 0.0


def recency_boost(last_active: datetime) -> float:
    """+0.10 if active within last 48 hours"""
    hours_ago = (datetime.now() - last_active).total_seconds() / 3600
    return 0.10 if hours_ago <= 48 else 0.0


def calculate_match_score(user_a: Dict, user_b: Dict) -> Dict:
    """Full matching algorithm"""
    # 1. Same-major toggle filter
    if user_a.get('sameMajorOnly') and user_a.get('major') != user_b.get('major'):
        return {'score': 0.0, 'breakdown': {
            'interestScore': 0, 'majorBoost': 0, 'dormBoost': 0,
            'yearBoost': 0, 'recencyBoost': 0, 'randomFactor': 0
        }}
    
    # 2. Interest similarity (60% weight)
    interest_sim = weighted_jaccard(
        user_a.get('interests', []),
        user_b.get('interests', [])
    )
    interest_score = interest_sim * 0.6
    
    # 3. Dorm boost
    dorm_b = dorm_boost(user_a.get('dorm'), user_b.get('dorm'))
    
    # 4. Year boost
    year_b = 0.05 if user_a.get('year') == user_b.get('year') else 0.0
    
    # 5. Recency boost (more recent user)
    last_a = user_a.get('lastActive', datetime.now() - timedelta(days=30))
    last_b = user_b.get('lastActive', datetime.now() - timedelta(days=30))
    recency_b = recency_boost(max(last_a, last_b))
    
    # 6. Major boost (none when toggle OFF, filter captures when ON)
    major_b = 0.0
    
    # 7. Sum & clamp
    raw = interest_score + major_b + dorm_b + year_b + recency_b
    raw = max(0.0, min(1.0, raw))
    
    # 8. Randomization
    random_noise = random.uniform(0, 0.15)
    final = raw * 0.85 + random_noise
    
    return {
        'score': min(1.0, final),
        'breakdown': {
            'interestScore': round(interest_score, 4),
            'majorBoost': major_b,
            'dormBoost': round(dorm_b, 4),
            'yearBoost': year_b,
            'recencyBoost': recency_b,
            'randomFactor': round(random_noise, 4),
        }
    }


#  Test cases 

def run_tests():
    random.seed(42)  # reproducible random
    now = datetime.now()
    
    test_cases = [
        {
            'name': 'High overlap, same dorm & year',
            'a': { 'interests': ['coding','hiking','chess'], 'major':'CS', 'dorm':'Stirling Hall', 'year':3, 'lastActive': now - timedelta(hours=2), 'sameMajorOnly':False },
            'b': { 'interests': ['coding','hiking','music','gaming'], 'major':'CS', 'dorm':'Stirling Hall', 'year':3, 'lastActive': now - timedelta(hours=5) },
            'expected': {'min':0.4, 'max':0.75},  # interest ~0.19, dorm0.15, year0.05, recency0.1, rand 0-0.15
        },
        {
            'name': 'Low overlap, diff dorms',
            'a': { 'interests': ['coding'], 'major':'CS', 'dorm':'Stirling Hall', 'year':1, 'lastActive': now - timedelta(hours=10), 'sameMajorOnly':False },
            'b': { 'interests': ['music','art'], 'major':'Math', 'dorm':'Engineering Hall', 'year':2, 'lastActive': now - timedelta(hours=20) },
            'expected': {'min':0.1, 'max':0.35},
        },
        {
            'name': 'Same-major toggle ON, matching majors',
            'a': { 'interests': ['coding'], 'major':'CS', 'dorm':None, 'year':2, 'lastActive': now - timedelta(hours=5), 'sameMajorOnly':True },
            'b': { 'interests': ['music'], 'major':'CS', 'dorm':None, 'year':3, 'lastActive': now - timedelta(hours=10) },
            'expected': {'min':0.08, 'max':0.35},  # recency + random, low interest, year mismatch
        },
        {
            'name': 'Same-major toggle ON, different majors (should be 0)',
            'a': { 'interests': ['coding'], 'major':'CS', 'dorm':None, 'year':2, 'lastActive': now - timedelta(hours=5), 'sameMajorOnly':True },
            'b': { 'interests': ['music'], 'major':'Math', 'dorm':None, 'year':2, 'lastActive': now - timedelta(hours=10) },
            'expected': {'min':0, 'max':0},
        },
        {
            'name': 'Dorm complex match (Stirling Hall vs Stirling Tower)',
            'a': { 'interests': ['coding','coffee'], 'major':'CS', 'dorm':'Stirling Hall', 'year':2, 'lastActive': now - timedelta(hours=5), 'sameMajorOnly':False },
            'b': { 'interests': ['coding','music'], 'major':'CS', 'dorm':'Stirling Tower', 'year':2, 'lastActive': now - timedelta(hours=10) },
            'expected': {'min':0.25, 'max':0.55},
        },
        {
            'name': 'One user with no dorm',
            'a': { 'interests': ['coding','hiking'], 'major':'CS', 'dorm':'Stirling Hall', 'year':2, 'lastActive': now - timedelta(hours=5), 'sameMajorOnly':False },
            'b': { 'interests': ['coding','music'], 'major':'CS', 'dorm':None, 'year':2, 'lastActive': now - timedelta(hours=10) },
            'expected': {'min':0.25, 'max':0.55},
        },
    ]
    
    print("=" * 70)
    print("       MATCHING ALGORITHM TEST (Python)")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for i, tc in enumerate(test_cases, 1):
        print(f"\n[Test {i}] {tc['name']}")
        result = calculate_match_score(tc['a'], tc['b'])
        score = result['score']
        expected = tc['expected']
        
        print(f"   Score: {score:.4f}  (expected {expected['min']}-{expected['max']})")
        print(f"   Breakdown: {result['breakdown']}")
        
        in_range = expected['min'] <= score <= expected['max']
        
        if expected['min'] == 0 and expected['max'] == 0:
            if score < 0.01:
                print("   [PASS] score ~0 as expected")
                passed += 1
            else:
                print("   [FAIL] score should be 0")
                failed += 1
        elif in_range:
            print("   [PASS]")
            passed += 1
        else:
            print("   [FAIL] out of range")
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 70)
    
    if failed == 0:
        print("\n[OK] ALL TESTS PASSED!\n")
    else:
        print(f"\n[WARN] {failed} test(s) failed\n")


def test_weighted_jaccard():
    print("\n" + "=" * 70)
    print("       WEIGHTED JACCARD UNIT TESTS")
    print("=" * 70)
    
    # Override frequencies for this test
    global INTEREST_FREQUENCIES
    original = INTEREST_FREQUENCIES.copy()
    INTEREST_FREQUENCIES = {
        'common': 100,   # weight ~0.217
        'rare': 5,       # weight ~0.558
        'medium': 20,    # weight ~0.328
    }
    
    common_w = get_interest_weight('common')
    rare_w = get_interest_weight('rare')
    medium_w = get_interest_weight('medium')
    
    tests = [
        { 'name': 'Identical sets -> 1.0', 'a': ['common','rare'], 'b': ['common','rare'], 'expected': 1.0 },
        { 'name': 'No overlap -> 0.0', 'a': ['common'], 'b': ['rare'], 'expected': 0.0 },
        { 'name': 'Partial overlap', 'a': ['common','medium','rare'], 'b': ['common','rare'], 'expected': (common_w + rare_w) / (common_w + medium_w + rare_w) },
    ]
    
    for tc in tests:
        result = weighted_jaccard(tc['a'], tc['b'])
        if tc['expected'] is not None:
            ok = abs(result - tc['expected']) < 0.001
            status = "[PASS]" if ok else "[FAIL]"
            print(f"{status} {tc['name']}: {result:.4f} (expected {tc['expected']:.4f})")
        else:
            print(f"[INFO] {tc['name']}: {result:.4f}")
    
    # Restore
    INTEREST_FREQUENCIES = original


if __name__ == '__main__':
    test_weighted_jaccard()
    run_tests()
