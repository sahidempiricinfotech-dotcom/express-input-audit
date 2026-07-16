# Express Input Audit Seed

This monorepo contains an Express 4 API gateway, domain services for orders, uploads, and administration, plus shared middleware. The gateway composes mounted API paths while each service owns short local router paths.

## Layout

- services/api-gateway/ — application mount point and gateway-owned routes
- services/orders-api/ — order routes, persistence model, import service, and webhook handlers
- services/uploads-api/ — multipart upload routes
- services/admin-api/ — administrative routes mounted by the gateway
- shared/middleware/ — reusable request, authorization, validation, tenant, rate-limit, and error middleware

Install dependencies from the repository root and run the gateway with npm start.
