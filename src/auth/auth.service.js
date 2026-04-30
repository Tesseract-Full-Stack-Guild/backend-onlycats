"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var bcrypt_1 = require("bcrypt");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(prisma, user, jwt) {
            this.prisma = prisma;
            this.user = user;
            this.jwt = jwt;
        }
        AuthService_1.prototype.signUp = function (registerDto) {
            return __awaiter(this, void 0, void 0, function () {
                var username, email, password, existing, passwordHash, newUser;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            username = registerDto.username, email = registerDto.email, password = registerDto.password;
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { username: username } })];
                        case 1:
                            existing = _a.sent();
                            if (existing)
                                throw new common_1.BadRequestException('Username already taken');
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                        case 2:
                            existing = _a.sent();
                            if (existing)
                                throw new common_1.BadRequestException('Email already used');
                            return [4 /*yield*/, bcrypt_1.default.hash(password, 12)];
                        case 3:
                            passwordHash = _a.sent();
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        username: username,
                                        email: email,
                                        passwordHash: passwordHash,
                                    },
                                    select: {
                                        id: true,
                                        username: true,
                                        email: true,
                                    },
                                })];
                        case 4:
                            newUser = _a.sent();
                            return [2 /*return*/, {
                                    message: 'User registered successfully!',
                                    newUser: newUser,
                                }];
                    }
                });
            });
        };
        AuthService_1.prototype.validateUser = function (loginDto) {
            return __awaiter(this, void 0, void 0, function () {
                var usernameOrEmail, password, user, comparePassword;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            usernameOrEmail = loginDto.usernameOrEmail, password = loginDto.password;
                            return [4 /*yield*/, this.user.findUserByUsername(usernameOrEmail)];
                        case 1:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.user.findUserByEmail(usernameOrEmail)];
                        case 2:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.UnauthorizedException('Invalid username/password');
                            _a.label = 3;
                        case 3:
                            if (!user.passwordHash) {
                                throw new common_1.UnauthorizedException('No password set for user');
                            }
                            return [4 /*yield*/, bcrypt_1.default.compare(password, user.passwordHash)];
                        case 4:
                            comparePassword = _a.sent();
                            if (!comparePassword)
                                throw new common_1.UnauthorizedException('Invalid username/password');
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        AuthService_1.prototype.login = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, accessToken, refreshToken, tokenHash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            payload = {
                                sub: user.id,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                            };
                            accessToken = this.jwt.sign(payload, {
                                secret: process.env.ACCESS_SECRET,
                                expiresIn: '15m',
                            });
                            refreshToken = this.jwt.sign(payload, {
                                secret: process.env.REFRESH_SECRET,
                                expiresIn: '7d',
                            });
                            return [4 /*yield*/, bcrypt_1.default.hash(refreshToken, 10)];
                        case 1:
                            tokenHash = _a.sent();
                            return [4 /*yield*/, this.prisma.refreshToken.create({
                                    data: {
                                        userId: user.id,
                                        tokenHash: tokenHash,
                                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                    },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { accessToken: accessToken, refreshToken: refreshToken }];
                    }
                });
            });
        };
        AuthService_1.prototype.validateRefreshToken = function (userId, token) {
            return __awaiter(this, void 0, void 0, function () {
                var tokensInDB, _i, tokensInDB_1, t, match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.refreshToken.findMany({
                                where: { userId: userId, revokedAt: null },
                            })];
                        case 1:
                            tokensInDB = _a.sent();
                            if (!tokensInDB)
                                throw new common_1.UnauthorizedException('Invalid or expired token!');
                            _i = 0, tokensInDB_1 = tokensInDB;
                            _a.label = 2;
                        case 2:
                            if (!(_i < tokensInDB_1.length)) return [3 /*break*/, 5];
                            t = tokensInDB_1[_i];
                            return [4 /*yield*/, bcrypt_1.default.compare(token, t.tokenHash)];
                        case 3:
                            match = _a.sent();
                            if (match)
                                return [2 /*return*/, t];
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: throw new common_1.UnauthorizedException('Invalid refresh token!');
                    }
                });
            });
        };
        AuthService_1.prototype.refresh = function (oldToken) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, userId, existingToken, user, newPayload, accessToken, refreshToken, tokenHash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jwt.verify(oldToken, {
                                secret: process.env.REFRESH_SECRET,
                            })];
                        case 1:
                            payload = _a.sent();
                            userId = payload.sub;
                            return [4 /*yield*/, this.validateRefreshToken(userId, oldToken)];
                        case 2:
                            existingToken = _a.sent();
                            if (!!existingToken) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.refreshToken.updateMany({
                                    where: { userId: userId },
                                    data: { revokedAt: new Date() },
                                })];
                        case 3:
                            _a.sent();
                            throw new common_1.UnauthorizedException('Token reuse detected!');
                        case 4: return [4 /*yield*/, this.prisma.refreshToken.update({
                                where: { id: existingToken.id },
                                data: { revokedAt: new Date() },
                            })];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 6:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.UnauthorizedException('User not found');
                            newPayload = {
                                sub: user.id,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                            };
                            accessToken = this.jwt.sign(newPayload, {
                                secret: process.env.ACCESS_SECRET,
                                expiresIn: '15m',
                            });
                            refreshToken = this.jwt.sign(newPayload, {
                                secret: process.env.REFRESH_SECRET,
                                expiresIn: '7d',
                            });
                            return [4 /*yield*/, bcrypt_1.default.hash(refreshToken, 10)];
                        case 7:
                            tokenHash = _a.sent();
                            return [4 /*yield*/, this.prisma.refreshToken.create({
                                    data: {
                                        userId: user.id,
                                        tokenHash: tokenHash,
                                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                    },
                                })];
                        case 8:
                            _a.sent();
                            return [2 /*return*/, { accessToken: accessToken, refreshToken: refreshToken }];
                    }
                });
            });
        };
        AuthService_1.prototype.logout = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var payload;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.jwt.verify(token, {
                                secret: process.env.REFRESH_SECRET,
                            })];
                        case 1:
                            payload = _a.sent();
                            return [4 /*yield*/, this.prisma.refreshToken.updateMany({
                                    where: { userId: payload.sub },
                                    data: { revokedAt: new Date() },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
