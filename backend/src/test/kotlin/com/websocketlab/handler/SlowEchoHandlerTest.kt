package com.websocketlab.handler

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.net.URI

class SlowEchoHandlerTest {

    @Test
    fun `given a URI with delay, when extracted, then returns the delay value`() {
        val uri = URI.create("ws://localhost:8080/ws/slow/500")
        assertEquals(500L, SlowEchoHandler.extractDelayMs(uri))
    }

    @Test
    fun `given a URI without valid delay, when extracted, then returns default 1000`() {
        val uri = URI.create("ws://localhost:8080/ws/slow/abc")
        assertEquals(1000L, SlowEchoHandler.extractDelayMs(uri))
    }

    @Test
    fun `given a URI with trailing slash, when extracted, then returns default 1000`() {
        val uri = URI.create("ws://localhost:8080/ws/slow/")
        assertEquals(1000L, SlowEchoHandler.extractDelayMs(uri))
    }

    @Test
    fun `given a text message, when slow echoed with virtual time, then message is delayed`() {
        val session = TestWebSocketSession(
            uri = URI.create("ws://localhost:8080/ws/slow/2000")
        )
        val handler = SlowEchoHandler()

        handler.handle(session).subscribe()
        session.sendMessage("hello")
        session.complete()

        reactor.test.StepVerifier.withVirtualTime { session.sentMessages().map { it.payloadAsText } }
            .expectSubscription()
            .expectNext("hello")
            .verifyComplete()
    }
}
