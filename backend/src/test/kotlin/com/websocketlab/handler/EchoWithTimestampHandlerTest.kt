package com.websocketlab.handler

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import reactor.test.StepVerifier
import java.time.Instant

class EchoWithTimestampHandlerTest {

    private val objectMapper = ObjectMapper()
    private val handler = EchoWithTimestampHandler(objectMapper)

    @Test
    fun `given a text message, when echoed with timestamp, then response contains the original message`() {
        val session = TestWebSocketSession()

        handler.handle(session).subscribe()
        session.sendMessage("hello")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .assertNext { json ->
                val parsed: Map<String, String> = objectMapper.readValue(json)
                assertEquals("hello", parsed["originalMessage"])
            }
            .verifyComplete()
    }

    @Test
    fun `given a text message, when echoed with timestamp, then response contains a valid timestamp`() {
        val session = TestWebSocketSession()

        handler.handle(session).subscribe()
        session.sendMessage("test")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .assertNext { json ->
                val parsed: Map<String, String> = objectMapper.readValue(json)
                val timestamp = parsed["serverTimestamp"]!!
                Instant.parse(timestamp) // throws if invalid
            }
            .verifyComplete()
    }

    @Test
    fun `given a text message, when echoed with timestamp, then response is valid JSON`() {
        val session = TestWebSocketSession()

        handler.handle(session).subscribe()
        session.sendMessage("check json")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .assertNext { json ->
                val parsed: Map<String, String> = objectMapper.readValue(json)
                assertTrue(parsed.containsKey("originalMessage"))
                assertTrue(parsed.containsKey("serverTimestamp"))
                assertEquals(2, parsed.size)
            }
            .verifyComplete()
    }
}
