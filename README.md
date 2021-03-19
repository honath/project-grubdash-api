# Project: GrubDash

## Overview
Develop an API and build specific routes to connect to a separate frontend to handle valid and invalid requests.

## Skills Used
- RESTful API development practices
- Validation middleware for handler functions
- Use of response.locals for data transfer between middleware and handler functions
- Appropriate use of HTTP response status codes for both successful and unsuccessful requests

## File Structure
- /src
    + app.js (Root route controller)
    + server.js 
    - /src/data
        - dishes-data (Stores "dishes" array locally)
        - orders-data (Stores "orders" array locally)
    - /src/dishes
        - dishes.controller (Validation middleware and endpoints for /dishes route)
        - dishes.router (Route controller for /dishes route)
    - /src/orders 
        - orders.controller (Validation middleware and endpoints for /orders route)
        - orders.router (Route controller for /orders route)
    - /src/errors
        - errorHandler (General purpose catch-all error handler)
        - methodNotAllowed (Catches requests not allowed for routes)
        - notFound (General purpose 404 error handler)
    - /src/utils
        - nextId (Provides unique hex ID for some API endpoint functions)
    
