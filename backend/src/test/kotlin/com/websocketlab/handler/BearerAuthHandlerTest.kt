package com.websocketlab.handler

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import reactor.test.StepVerifier
import java.net.URI

class BearerAuthHandlerTest {

    private val handler = BearerAuthHandler()

    @Test
    fun `given a valid bearer token, when message sent, then echoes the message`() {
        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer test-token")
        }
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/bearer"),
            headers = headers
        )

        handler.handle(session).subscribe()
        session.sendMessage("hello")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("hello")
            .verifyComplete()
    }

    @Test
    fun `given an invalid bearer token, when connected, then closes with 4401`() {
        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer wrong-token")
        }
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/bearer"),
            headers = headers
        )

        StepVerifier.create(handler.handle(session))
            .verifyComplete()

        assertEquals(4401, session.getCloseStatus()?.code)
        assertTrue(session.isClosed())
    }

    @Test
    fun `given no authorization header, when connected, then closes with 4401`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/bearer")
        )

        StepVerifier.create(handler.handle(session))
            .verifyComplete()

        assertEquals(4401, session.getCloseStatus()?.code)
        assertTrue(session.isClosed())
    }

    @Test
    fun `given a valid token in query param, when message sent, then echoes the message`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/bearer?token=test-token")
        )

        handler.handle(session).subscribe()
        session.sendMessage("hello")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("hello")
            .verifyComplete()
    }

    @Test
    fun `given an invalid token in query param, when connected, then closes with 4401`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/auth/bearer?token=wrong-token")
        )

        StepVerifier.create(handler.handle(session))
            .verifyComplete()

        assertEquals(4401, session.getCloseStatus()?.code)
        assertTrue(session.isClosed())
    }
}
