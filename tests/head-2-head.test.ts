import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { Head2HeadBetCancelled } from "../generated/Head2Head/Head2Head"
import { handleHead2HeadBetCancelled } from "../src/head-2-head"
import { createHead2HeadBetCancelledEvent } from "./head-2-head-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let gameId = BigInt.fromI32(234)
    let better = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let stockId = BigInt.fromI32(234)
    let newHead2HeadBetCancelledEvent = createHead2HeadBetCancelledEvent(
      gameId,
      better,
      stockId
    )
    handleHead2HeadBetCancelled(newHead2HeadBetCancelledEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "gameId",
      "234"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "better",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "stockId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
