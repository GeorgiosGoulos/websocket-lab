package com.websocketlab.handler

import org.junit.jupiter.api.Test
import reactor.test.StepVerifier
import java.net.URI

class ChatHandlerTest {

    @Test
    fun `given two sessions, when one sends a message, then both receive it`() {
        val handler = ChatHandler()
        val session1 = TestWebSocketSession(uri = URI.create("ws://localhost:8080/ws/chat"))
        val session2 = TestWebSocketSession(uri = URI.create("ws://localhost:8080/ws/chat"))

        handler.handle(session1).subscribe()
        handler.handle(session2).subscribe()

        session1.sendMessage("hello from 1")
        session1.complete()
        session2.complete()

        StepVerifier.create(session1.sentMessages().map { it.payloadAsText }.take(1))
            .expectNext("hello from 1")
            .verifyComplete()

        StepVerifier.create(session2.sentMessages().map { it.payloadAsText }.take(1))
            .expectNext("hello from 1")
            .verifyComplete()
    }

    @Test
    fun `given a session, when it sends a message, then it receives its own message`() {
        val handler = ChatHandler()
        val session = TestWebSocketSession(uri = URI.create("ws://localhost:8080/ws/chat"))

        handler.handle(session).subscribe()

        session.sendMessage("echo to self")
        session.complete()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText }.take(1))
            .expectNext("echo to self")
            .verifyComplete()
    }
}
