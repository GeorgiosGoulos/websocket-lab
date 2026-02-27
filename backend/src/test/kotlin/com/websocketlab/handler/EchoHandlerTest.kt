package com.websocketlab.handler

import org.junit.jupiter.api.Test
import reactor.test.StepVerifier

class EchoHandlerTest {

    private val handler = EchoHandler()

    @Test
    fun `given a text message, when echoed, then returns the same message`() {
        val session = TestWebSocketSession()

        handler.handle(session).subscribe()
        session.sendMessage("hello")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("hello")
            .verifyComplete()
    }

    @Test
    fun `given multiple messages, when echoed, then returns all messages in order`() {
        val session = TestWebSocketSession()

        handler.handle(session).subscribe()
        session.sendMessage("first")
        session.sendMessage("second")
        session.sendMessage("third")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("first")
            .expectNext("second")
            .expectNext("third")
            .verifyComplete()
    }

    @Test
    fun `given an empty message, when echoed, then returns an empty message`() {
        val session = TestWebSocketSession()

        handler.handle(session).subscribe()
        session.sendMessage("")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText })
            .expectNext("")
            .verifyComplete()
    }
}
