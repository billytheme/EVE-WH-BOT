import { expect } from "chai"
import rewire = require("rewire")
import * as utils from "../src/utils/utils"

let zKillboardWatch = rewire("../src/zKillboardWatch/zKillboardWatch")

describe('zKillboardWatcher', function () {
    describe('isKillInChain', function () {
        it('should return 0 when given a kill from deep', function () {
            expect(zKillboardWatch.__get__('isKillInChain')(killFromDeep)).to.be.equal(true)
        })
    })
})

let killFromDeep = {
    "attackers": [
        {
            "damage_done": 883,
            "faction_id": 500021,
            "final_blow": true,
            "security_status": 0,
            "ship_type_id": 30208
        }
    ],
    "killmail_id": 85061635,
    "killmail_time": "2020-06-19T06:33:57Z",
    "solar_system_id": 31002458,
    "victim": {
        "character_id": 95534436,
        "corporation_id": 98548597,
        "damage_taken": 883,
        "items": [
            {
                "flag": 27,
                "item_type_id": 3638,
                "quantity_destroyed": 1,
                "singleton": 0
            },
            {
                "flag": 19,
                "item_type_id": 21857,
                "quantity_dropped": 1,
                "singleton": 0
            },
            {
                "flag": 28,
                "item_type_id": 3651,
                "quantity_destroyed": 1,
                "singleton": 0
            }
        ],
        "position": {
            "x": -125392721503.99855,
            "y": 257725607835.59406,
            "z": -208447684510.52673
        },
        "ship_type_id": 606
    }
}