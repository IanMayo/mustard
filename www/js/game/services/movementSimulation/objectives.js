/**
 * Created by ian on 14/02/14.
 */

/**
 *
 * @param tNow the current time
 * @param objectives the array of objectives
 * @param scenario the current scenario state
 */
doObjectives = function (gameState, objectives, scenario) {
    var res;

    // ok, loop through the objectives
    for (var i = 0; i < objectives.length; i++) {
        var thisObj = objectives[i];
        res = handleThis(gameState, thisObj, scenario)
    }
}

handleThis = function (gameState, objective, scenario) {
    var thisType = objective.type;
    var res;

    switch (thisType) {
        case "SEQUENCE":

            var thisId = 0;
            var STOP_CHECKING = false;  // flag for if an object hasn't been reached yet

            // loop through all, or until we don't get a result object
            do
            {
                // get the next child
                var child = objective.children[thisId];

                // is this one complete?
                if(!(child.complete))
                {
                    // ok, run it
                    handleThis(gameState, child, scenario);

                    // did it finish?
                    if(child.complete)
                    {
                        // OK. For a sequence we have to override the game state setting.
                        // this is because a STOP is actually a PAUSE if we're not at the last one yet.

                        // is this the last one?  If it's not we  will switch
                        // a stop instruction to a pause one
                        if((thisId+1) == objective.children.length)
                        {
                            // ok, this is the last one. we can do an actual stop
                            gameState.state="DO_STOP";
                            console.log("doing stop");
                        }
                        else
                        {
                            gameState.state="DO_PAUSE";
                            console.log("doing pause");
                        }
                    }
                    else
                    {
                        // that one isn't ready. move on
                        STOP_CHECKING = true;
                    }
                }
                else
                {
                    // don't worry - move on the next one
                }

                // move to the next child
                thisId++;
            }
            while((thisId < objective.children.length) && (!STOP_CHECKING))

            // Blah
            break;
        case "PROXIMITY":
            handleProximity(gameState, objective, scenario);
            break;
    }
}

handleProximity = function(gameState, proximity, scenario)
{
    // right, do we have an elapsed time limit
    if(proximity.elapsed)
    {
        // ok. do we know when this objective started?
        if(!proximity.stopTime)
        {
            // no, better store it
            proximity.stopTime = gameState.tNow + (proximity.elapsed * 1000);
        }
    }

    // ok, where has he got to get to?
    var dest = proximity.location;

    // where is v1
    var current = scenario.vessels[0].state.location;

    // what's the range?
    var range = rhumbDistanceFromTo(dest, current);

    console.log("doing:" + proximity.name + " at:" + gameState.tNow+ "  stop Time:" + proximity.stopTime + " range:" + Math.floor(range));

    if(range < proximity.range)
    {
        proximity.complete = true;
        console.log("Proximity complete:" + proximity.name);
        gameState.successMessage = proximity.success;
        gameState.state = "DO_STOP";
    }

    // right, just check if we have failed to reach our proximity in time
    if(proximity.stopTime)
    {
        if(gameState.tNow > proximity.stopTime)
        {
            // did we succeed on this step
            if(proximity.complete)
            {
                // ok, let's allow the success
                console.log("allow elapsed proximity to succeed");
            }
            else
            {
                // ok, game failure
                proximity.complete = true;
                console.log("proximity failed");
                gameState.failureMessage = proximity.failure;
                gameState.state = "DO_STOP";
            }
        }
    }
}