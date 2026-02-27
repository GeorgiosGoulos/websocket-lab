package com.websocketlab.handler

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import reactor.test.StepVerifier
import java.net.URI

class TokenAuthHandlerTest {

    private val handler = TokenAuthHandler()

    @Test
    fun `given a valid auth message, when subsequent messages sent, then echoes them`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/token")
        )

        handler.handle(session).subscribe()
        session.sendMessage("""{"type":"auth","token":"test-token"}""")
        session.sendMessage("hello")
        session.sendMessage("world")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("hello")
            .expectNext("world")
            .verifyComplete()
    }

    @Test
    fun `given an invalid token in auth message, when connected, then closes with 4401`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/token")
        )

        handler.handle(session).subscribe()
        session.sendMessage("""{"type":"auth","token":"wrong-token"}""")
        session.complete()

        assertEquals(4401, session.getCloseStatus()?.code)
        assertTrue(session.isClosed())
    }

    @Test
    fun `given a non-auth first message, when connected, then closes with 4401`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/token")
        )

        handler.handle(session).subscribe()
        session.sendMessage("just a regular message")
        session.complete()

        assertEquals(4401, session.getCloseStatus()?.code)
        assertTrue(session.isClosed())
    }
}
