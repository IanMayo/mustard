/**
 * Created by ian on 14/02/14.
 */
var scenario = {
    "vessels": [
        {
            "name": "Ownship",
            "categories": ["BLUE", "SURFACE", "WARSHIP"],
            "behaviours": [],
            "sonars": [
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

    ],
    "patrolArea": [
        [50.15, -8.25],
        [49.85, -7.75]
    ],
    "environment": {},
    "objectives": {},
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
                ]}, "id": "OpsArea"},
            {"type": "Feature",
                "properties": {"name": "Ops Area"},
                "geometry": {"type": "Point", "coordinates":

                        [-8, 50]

                }, "id": "Destination"}
        ]
    }
};