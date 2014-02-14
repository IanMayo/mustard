/**
 * Created by ian on 14/02/14.
 */
scenarios.scenario1c = {
    "vessels": [
        {
            "name": "Ownship",
            "categories": ["BLUE", "SURFACE", "WARSHIP"],
            "behaviours": [],
            "sonars": [
                {
                    "name": "BASIC_TOWED",
                    "categories": ["NO_SIMPLE_SELF_NOISE", "NO_COMPLEX_SELF_NOISE"],
                    "offset": -1000,
                    "ArrayGain": 18,
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
                "location": {"lat": 50, "lng": -8.18},
                "course": 90,
                "demCourse": 90,
                "demSpeed": 12,
                "speed": 12,
                "height": 0,
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
            ],
            "radiatedNoise": {
                "baseLevel": 100,
                "speedPattern": "Uniform"
            },
            "state": {
                "categories": [],
                "location": {"lat": 49.99, "lng": -7.82},
                "course": 345,
                "demCourse": 345,
                "demSpeed": 11,
                "speed": 11,
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
    "objectives": [
        {"name": "Gain & keep contact", "type": "SEQUENCE", "children": [
            {"name": "Gain contact", type: "GAIN_CONTACT", "elapsed": 900,
                "success": "Well done, you've gained contact within the 15 minute limit",
                "failure": "Sorry, you didn't make contact in time. You do just have to keep heading East!"},
            {"name": "Maintain contact", type: "MAINTAIN_CONTACT", "elapsed": 3600,
                "success": "Well done, you've held contact for one hour",
                "failure": "More practice needed, you only held contact for [time] minutes."}
        ]}
    ],
    "welcome" : "Right, time to increase the complexity. The array will no longer do bearing resolution for you - the target could be to the left or right. So, head to the East, and gain your contact. You've got 15 minutes",
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