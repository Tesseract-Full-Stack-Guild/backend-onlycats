"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var core_1 = require("@nestjs/core");
var app_module_1 = require("./app.module");
var common_1 = require("@nestjs/common");
var path_1 = require("path");
var cookie_parser_1 = require("cookie-parser");
var express = require("express");
var request_logger_middleware_1 = require("./common/middleware/request-logger.middleware");
var uploadsDir = (0, path_1.join)(__dirname, '..', '..', 'uploads');
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, normalizeOrigin, envWhitelist, isLocalhost, port;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule)];
                case 1:
                    app = _b.sent();
                    // Request logging middleware
                    app.use(new request_logger_middleware_1.RequestLoggerMiddleware().use.bind(new request_logger_middleware_1.RequestLoggerMiddleware()));
                    app.use((0, cookie_parser_1.default)());
                    app.use('/uploads', express.static(uploadsDir));
                    // Global prefix - disabled to avoid conflict with versioning
                    // app.setGlobalPrefix('v1');
                    // Global validation
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        transform: true,
                        transformOptions: { enableImplicitConversion: true },
                    }));
                    normalizeOrigin = function (origin) { return origin.replace(/\/+$/, ''); };
                    envWhitelist = ((_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',').map(normalizeOrigin)) || [];
                    isLocalhost = function (origin) {
                        try {
                            var url = new URL(origin);
                            return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
                        }
                        catch (_a) {
                            return false;
                        }
                    };
                    app.enableCors({
                        origin: function (origin, callback) {
                            if (!origin)
                                return callback(null, true);
                            var normalizedOrigin = normalizeOrigin(origin);
                            var isAllowed = envWhitelist.includes(normalizedOrigin) || isLocalhost(normalizedOrigin);
                            console.log("[CORS] ".concat(origin, " -> ").concat(isAllowed ? 'ALLOWED' : 'DENIED', " (whitelist: ").concat(envWhitelist.join(', ') || 'empty', ")"));
                            callback(null, isAllowed);
                        },
                        credentials: true,
                    });
                    // Versioning
                    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
                    // Global error handler
                    app.use(function (err, req, res, next) {
                        console.error("[ERROR] ".concat(req.method, " ").concat(req.url), err.message, err.stack);
                        res.status(err.status || 500).json({
                            statusCode: err.status || 500,
                            message: err.message || 'Internal server error',
                        });
                    });
                    port = process.env.PORT || 3000;
                    return [4 /*yield*/, app.listen(port)];
                case 2:
                    _b.sent();
                    console.log("Server running on port ".concat(port));
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap();
