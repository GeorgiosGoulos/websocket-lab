package com.websocketlab.handler

import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Duration

class CounterStreamHandler : WebSocketHandler {
    override fun handle(session: WebSocketSession): Mono<Void> {
        val counterFlux = Flux.interval(Duration.ofSeconds(1))
            .map { session.textMessage(it.toString()) }

        return session.send(counterFlux).and(session.receive().then())
    }
}
