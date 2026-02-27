package com.websocketlab.handler

import org.reactivestreams.Publisher
import org.springframework.http.HttpHeaders
import org.springframework.web.reactive.socket.CloseStatus
import org.springframework.web.reactive.socket.HandshakeInfo
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.Sinks
import java.net.URI

class TestWebSocketSession(
    uri: URI = URI.create("ws://localhost:8080/ws/echo"),
    headers: HttpHeaders = HttpHeaders()
) : WebSocketSession {

    private val inboundSink = Sinks.many().unicast().onBackpressureBuffer<WebSocketMessage>()
    private val outboundSink = Sinks.many().unicast().onBackpressureBuffer<WebSocketMessage>()
    private var closeStatus: CloseStatus? = null
    private var closed = false

    private val _handshakeInfo = HandshakeInfo(uri, headers, Mono.empty(), null)

    fun sendMessage(text: String) {
        inboundSink.tryEmitNext(
            WebSocketMessage(WebSocketMessage.Type.TEXT, DefaultDataBufferFactory.wrap(text))
        )
    }

    fun complete() {
        inboundSink.tryEmitComplete()
    }

    fun sentMessages(): Flux<WebSocketMessage> = outboundSink.asFlux()

    fun getCloseStatus(): CloseStatus? = closeStatus

    fun isClosed(): Boolean = closed

    override fun getId(): String = "test-session"

    override fun getHandshakeInfo(): HandshakeInfo = _handshakeInfo

    override fun receive(): Flux<WebSocketMessage> = inboundSink.asFlux()

    override fun send(messages: Publisher<WebSocketMessage>): Mono<Void> =
        Flux.from(messages)
            .doOnNext { outboundSink.tryEmitNext(it) }
            .doOnComplete { outboundSink.tryEmitComplete() }
            .then()

    override fun isOpen(): Boolean = !closed

    override fun close(status: CloseStatus): Mono<Void> = Mono.fromRunnable {
        closeStatus = status
        closed = true
        outboundSink.tryEmitComplete()
    }

    override fun textMessage(payload: String): WebSocketMessage =
        WebSocketMessage(WebSocketMessage.Type.TEXT, DefaultDataBufferFactory.wrap(payload))

    override fun bufferFactory() = DefaultDataBufferFactory.INSTANCE

    // Not needed for tests
    override fun binaryMessage(payloadFactory: java.util.function.Function<org.springframework.core.io.buffer.DataBufferFactory, org.springframework.core.io.buffer.DataBuffer>): WebSocketMessage =
        throw UnsupportedOperationException()

    override fun pingMessage(payloadFactory: java.util.function.Function<org.springframework.core.io.buffer.DataBufferFactory, org.springframework.core.io.buffer.DataBuffer>): WebSocketMessage =
        throw UnsupportedOperationException()

    override fun pongMessage(payloadFactory: java.util.function.Function<org.springframework.core.io.buffer.DataBufferFactory, org.springframework.core.io.buffer.DataBuffer>): WebSocketMessage =
        throw UnsupportedOperationException()

    override fun closeStatus(): Mono<CloseStatus> = Mono.justOrEmpty(closeStatus)

    override fun getAttributes(): MutableMap<String, Any> = mutableMapOf()
}

object DefaultDataBufferFactory {
    val INSTANCE = org.springframework.core.io.buffer.DefaultDataBufferFactory()

    fun wrap(text: String): org.springframework.core.io.buffer.DataBuffer =
        INSTANCE.wrap(text.toByteArray(Charsets.UTF_8))
}
