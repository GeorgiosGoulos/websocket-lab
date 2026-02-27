package com.websocketlab.handler

import org.junit.jupiter.api.Test
import reactor.test.StepVerifier
import java.net.URI
import java.time.Duration

class CounterStreamHandlerTest {

    @Test
    fun `given a connection, when streaming, then emits incrementing counter values`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/stream/counter")
        )
        val handler = CounterStreamHandler()

        handler.handle(session).subscribe()

        StepVerifier.create(session.sentMessages().map { it.payloadAsText }.take(3))
            .expectNext("0")
            .expectNext("1")
            .expectNext("2")
            .verifyComplete()
    }
}
