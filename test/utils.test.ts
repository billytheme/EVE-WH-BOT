import { expect } from "chai"
import * as utils from "../src/utils/utils"

describe('utils', function () {
    this.timeout(5000)
    describe('getAllianceName', function () {
        it('should return the correct alliance name for the Alliance ID', async () => {
            expect(await utils.getAllianceName(99009511)).to.be.equal('Unchained Alliance')
        })
        it('should return None if there is no alliance ID', async () => {
            expect(await utils.getAllianceName(undefined)).to.be.equal('None')
        })
    })
    describe('getCorporationName', function () {
        it('should return Exit-Strategy', async () => {
            expect(await utils.getCorporationName(98380820)).to.be.equal('Exit-Strategy')
        })
        it('should return NPC', async () => {
            expect(await utils.getCorporationName(undefined)).to.be.equal('Unknown')
        })
    })
    describe('getCharacterName', function () {
        it('should return Nosha Izia', async () => {
            expect(await utils.getCharacterName(2112693921)).to.be.equal('Nosha Izia')
        })
        it('should return NPC', async () => {
            expect(await utils.getCharacterName(undefined)).to.be.equal('NPC')
        })
    })
})