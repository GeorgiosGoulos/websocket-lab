package com.websocketlab.handler

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import reactor.test.StepVerifier
import java.net.URI

class DisconnectAfterHandlerTest {

    @Test
    fun `given a URI with message count, when extracted, then returns the count`() {
        val uri = URI.create("ws://localhost:8080/ws/disconnect/after/3")
        assertEquals(3L, DisconnectAfterHandler.extractMaxMessages(uri))
    }

    @Test
    fun `given a URI without valid count, when extracted, then returns default 5`() {
        val uri = URI.create("ws://localhost:8080/ws/disconnect/after/abc")
        assertEquals(5L, DisconnectAfterHandler.extractMaxMessages(uri))
    }

    @Test
    fun `given max 2 messages, when 3 sent, then only 2 are echoed`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/disconnect/after/2")
        )
        val handler = DisconnectAfterHandler()

        handler.handle(session).subscribe()
        session.sendMessage("one")
        session.sendMessage("two")
        session.sendMessage("three")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("one")
            .expectNext("two")
            .verifyComplete()
    }
}
