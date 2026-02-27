package com.websocketlab.model

data class PathParam(
    val name: String,
    val type: String,
    val description: String
)

data class EndpointInfo(
    val path: String,
    val name: String,
    val description: String,
    val category: String,
    val pathParams: List<PathParam> = emptyList()
)
