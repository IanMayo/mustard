/**
 * Created by ian on 14/02/14.
 */
scenarios.scenario2c = {
    "vessels": [
        {
            "name": "Ownship",
            "categories": ["BLUE", "SURFACE", "WARSHIP"],
            "behaviours": [],
            "sonars": [
                {
                    "name": "BASIC_TOWED",
                    "categories": ["HAS_BOW_NULL"],
                    "offset": -1000,
                    "ArrayGain": 20,
                    "DT": -8
                }
            ],
            "radiatedNoise": {
                "baseLevel": 90,
                "speedPattern": "Uniform"
            },
            "state": {
                "time": 0,
                "categories": [],
                "location": {"lat": 50, "lng": -8.2},
                "height": 0,
                "course": 130,
                "speed": 10,
                "demCourse": 130,
                "demSpeed": 10,
                "demHeight": -10.0
            },
            "perf": {
                "turnRadius": 1200.0,
                "accelerationRate": 0.3,
                "decelerationRate": 0.8,
                "minSpeed": 4,
                "maxSpeed": 40,
                "climbRate": 1,
                "diveRate": 2
            }
        },
        {
            "name": "Target",
            "categories": ["RED", "SUBSURFACE", "SUBMARINE"],
            "behaviours": [
                {
                    "name": "Patrol area",
                    "type": "RECTANGLE_WANDER",
                    "tl": {"lat": 50.15, "lng": -8.25},
                    "br": {"lat": 49.85, "lng": -7.75},
                    "height": -30
                },
                {
                    "name": "Basic snort",
                    "type": "SNORT",
                    "height": -10,
                    "startLevel": 20,
                    "stopLevel": 90
                }
            ],
            "sonars": [
                {
                    "name": "BASIC_HULL",
                    "categories": ["NO_SIMPLE_SELF_NOISE", "NO_COMPLEX_SELF_NOISE", "NO_AMBIGUOUS"],
                    "offset": 0,
                    "ArrayGain": 28,
                    "DT": -8
                }
            ],
            "radiatedNoise": {
                "baseLevel": 100,
                "speedPattern": "Uniform"
            },
            "state": {
                "categories": [],
                "time": 0,
                "height": -40,
                "demHeight": -40.0,
                "batteryLevel": 60
            },
            "perf": {
                "turnRadius": 1200.0,
                "accelerationRate": 0.3,
                "decelerationRate": 0.8,
                "minSpeed": 4,
                "maxSpeed": 20,
                "batteryUsage": 0.00035,
                "chargeRate": 0.013,
                "climbRate": 1,
                "diveRate": 2
            }
        }
    ],
    "patrolArea": [
        [50.15, -8.25],
        [49.85, -7.75]
    ],
    "environment": {},
    "objectives": {},
    "welcome" : "No objectives set for this one yet. But, have a play and see the self-noise displayed",
    "features": {
        "type": "FeatureCollection", "features": [
            {"type": "Feature",
                "properties": {"name": "Ops Area"},
                "geometry": {"type": "Polygon", "coordinates": [
                    [
                        [-8.25, 50.15],
                        [-8.25, 49.85],
                        [-7.75, 49.85],
                        [-7.75, 50.15],
                        [-8.25, 50.15 ]
                    ]
                ]}, "id": "OpsArea"}
        ]}
};