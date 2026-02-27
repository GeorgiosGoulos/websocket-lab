package com.websocketlab.controller

import com.websocketlab.model.EndpointInfo
import com.websocketlab.model.PathParam
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class EndpointsController {

    @GetMapping("/api/endpoints")
    fun getEndpoints(): List<EndpointInfo> = ENDPOINTS

    companion object {
        val ENDPOINTS = listOf(
            EndpointInfo(
                path = "/ws/echo",
                name = "Echo",
                description = "Echoes back every text message you send.",
                category = "basic"
            ),
            EndpointInfo(
                path = "/ws/echo-with-timestamp",
                name = "Echo with Timestamp",
                description = "Echoes back a JSON object containing the original message and a server timestamp.",
                category = "basic"
            ),
            EndpointInfo(
                path = "/ws/auth/bearer",
                name = "Bearer Auth",
                description = "Requires a valid Bearer token in the Authorization header. Echoes messages if authenticated, closes with 4401 otherwise.",
                category = "auth"
            ),
            EndpointInfo(
                path = "/ws/auth/token",
                name = "Token Auth (First Message)",
                description = "Authenticates via the first WebSocket message. Send {\"type\":\"auth\",\"token\":\"...\"} as the first message. Echoes subsequent messages if authenticated, closes with 4401 otherwise.",
                category = "auth"
            ),
            EndpointInfo(
                path = "/ws/slow/{delayMs}",
                name = "Slow Echo",
                description = "Echoes messages after a configurable delay.",
                category = "timing",
                pathParams = listOf(
                    PathParam(
                        name = "delayMs",
                        type = "integer",
                        description = "Delay in milliseconds before echoing each message. Defaults to 1000."
                    )
                )
            ),
            EndpointInfo(
                path = "/ws/stream/counter",
                name = "Counter Stream",
                description = "Streams incrementing counter values (0, 1, 2, ...) every second.",
                category = "streaming"
            ),
            EndpointInfo(
                path = "/ws/disconnect/after/{n}",
                name = "Disconnect After N",
                description = "Echoes messages and disconnects after receiving N messages.",
                category = "lifecycle",
                pathParams = listOf(
                    PathParam(
                        name = "n",
                        type = "integer",
                        description = "Number of messages to echo before disconnecting. Defaults to 5."
                    )
                )
            ),
            EndpointInfo(
                path = "/ws/chat",
                name = "Chat",
                description = "Multi-client chat room. Messages from any client are broadcast to all connected clients.",
                category = "multi-client"
            )
        )
    }
}
