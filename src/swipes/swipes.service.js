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
exports.SwipesService = void 0;
var common_1 = require("@nestjs/common");
var SwipesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SwipesService = _classThis = /** @class */ (function () {
        function SwipesService_1(prisma, blocksService) {
            this.prisma = prisma;
            this.blocksService = blocksService;
        }
        SwipesService_1.prototype.swipe = function (swiperId_1, swipedId_1) {
            return __awaiter(this, arguments, void 0, function (swiperId, swipedId, action) {
                var isBlocked, _a, swiper, swiped, existingSwipe, updated, swipe;
                if (action === void 0) { action = 'LIKE'; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (swiperId === swipedId) {
                                throw new common_1.BadRequestException('Cannot swipe on yourself');
                            }
                            return [4 /*yield*/, this.blocksService.isBlocked(swiperId, swipedId)];
                        case 1:
                            isBlocked = _b.sent();
                            if (isBlocked) {
                                throw new common_1.ForbiddenException('Cannot swipe: user is blocked');
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.user.findUnique({ where: { id: swiperId } }),
                                    this.prisma.user.findUnique({ where: { id: swipedId } }),
                                ])];
                        case 2:
                            _a = _b.sent(), swiper = _a[0], swiped = _a[1];
                            if (!swiper || !swiped) {
                                throw new common_1.NotFoundException('User not found');
                            }
                            return [4 /*yield*/, this.prisma.swipe.findUnique({
                                    where: { swiperId_swipedId: { swiperId: swiperId, swipedId: swipedId } },
                                })];
                        case 3:
                            existingSwipe = _b.sent();
                            if (!existingSwipe) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.swipe.update({
                                    where: { id: existingSwipe.id },
                                    data: { action: action },
                                })];
                        case 4:
                            updated = _b.sent();
                            if (!(action === 'LIKE')) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.checkMutualMatch(swiperId, swipedId)];
                        case 5: return [2 /*return*/, _b.sent()];
                        case 6: return [2 /*return*/, { matched: false, previousSwipe: updated }];
                        case 7: return [4 /*yield*/, this.prisma.swipe.create({
                                data: { swiperId: swiperId, swipedId: swipedId, action: action },
                            })];
                        case 8:
                            swipe = _b.sent();
                            if (!(action === 'LIKE')) return [3 /*break*/, 10];
                            return [4 /*yield*/, this.checkMutualMatch(swiperId, swipedId)];
                        case 9: return [2 /*return*/, _b.sent()];
                        case 10: return [2 /*return*/, { matched: false, previousSwipe: swipe }];
                    }
                });
            });
        };
        SwipesService_1.prototype.checkMutualMatch = function (swiperId, swipedId) {
            return __awaiter(this, void 0, void 0, function () {
                var reverseSwipe, match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.swipe.findUnique({
                                where: { swiperId_swipedId: { swiperId: swipedId, swipedId: swiperId } },
                            })];
                        case 1:
                            reverseSwipe = _a.sent();
                            if (!(reverseSwipe && reverseSwipe.action === 'LIKE')) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.match.upsert({
                                    where: {
                                        initiatorId_targetId: { initiatorId: swiperId, targetId: swipedId },
                                    },
                                    update: {},
                                    create: { initiatorId: swiperId, targetId: swipedId },
                                })];
                        case 2:
                            match = _a.sent();
                            return [2 /*return*/, { matched: true, match: match }];
                        case 3: return [2 /*return*/, { matched: false }];
                    }
                });
            });
        };
        SwipesService_1.prototype.getMySwipes = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var swipes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.swipe.findMany({
                                where: { swiperId: userId },
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    swiped: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profile: {
                                                select: {
                                                    name: true,
                                                    age: true,
                                                    interests: true,
                                                    photos: { where: { isPrimary: true }, take: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            })];
                        case 1:
                            swipes = _a.sent();
                            return [2 /*return*/, swipes.map(function (s) {
                                    var _a, _b, _c, _d, _e;
                                    return ({
                                        id: s.id,
                                        action: s.action,
                                        createdAt: s.createdAt,
                                        user: {
                                            id: s.swiped.id,
                                            username: s.swiped.username,
                                            profile: {
                                                name: ((_a = s.swiped.profile) === null || _a === void 0 ? void 0 : _a.name) || null,
                                                age: ((_b = s.swiped.profile) === null || _b === void 0 ? void 0 : _b.age) || null,
                                                interests: ((_c = s.swiped.profile) === null || _c === void 0 ? void 0 : _c.interests) || [],
                                                photoUrl: ((_e = (_d = s.swiped.profile) === null || _d === void 0 ? void 0 : _d.photos[0]) === null || _e === void 0 ? void 0 : _e.url) || null,
                                            },
                                        },
                                    });
                                })];
                    }
                });
            });
        };
        SwipesService_1.prototype.getWhoLikedMe = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var likes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.swipe.findMany({
                                where: { swipedId: userId, action: 'LIKE' },
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    swiper: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profile: {
                                                select: {
                                                    name: true,
                                                    age: true,
                                                    interests: true,
                                                    photos: { where: { isPrimary: true }, take: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            })];
                        case 1:
                            likes = _a.sent();
                            return [2 /*return*/, likes.map(function (l) {
                                    var _a, _b, _c, _d, _e;
                                    return ({
                                        id: l.id,
                                        user: {
                                            id: l.swiper.id,
                                            username: l.swiper.username,
                                            profile: {
                                                name: ((_a = l.swiper.profile) === null || _a === void 0 ? void 0 : _a.name) || null,
                                                age: ((_b = l.swiper.profile) === null || _b === void 0 ? void 0 : _b.age) || null,
                                                interests: ((_c = l.swiper.profile) === null || _c === void 0 ? void 0 : _c.interests) || [],
                                                photoUrl: ((_e = (_d = l.swiper.profile) === null || _d === void 0 ? void 0 : _d.photos[0]) === null || _e === void 0 ? void 0 : _e.url) || null,
                                            },
                                        },
                                        createdAt: l.createdAt,
                                    });
                                })];
                    }
                });
            });
        };
        SwipesService_1.prototype.getMatches = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var matches;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.match.findMany({
                                where: {
                                    OR: [{ initiatorId: userId }, { targetId: userId }],
                                },
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    initiator: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profile: {
                                                select: {
                                                    name: true,
                                                    age: true,
                                                    interests: true,
                                                    photos: { where: { isPrimary: true }, take: 1 },
                                                },
                                            },
                                        },
                                    },
                                    target: {
                                        select: {
                                            id: true,
                                            username: true,
                                            profile: {
                                                select: {
                                                    name: true,
                                                    age: true,
                                                    interests: true,
                                                    photos: { where: { isPrimary: true }, take: 1 },
                                                },
                                            },
                                        },
                                    },
                                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                                },
                            })];
                        case 1:
                            matches = _a.sent();
                            return [2 /*return*/, matches.map(function (m) {
                                    var _a, _b, _c;
                                    var isInitiator = m.initiatorId === userId;
                                    var matchedUser = isInitiator ? m.target : m.initiator;
                                    var matchedUserProfile = matchedUser.profile;
                                    return {
                                        id: m.id,
                                        matchedAt: m.createdAt,
                                        lastMessage: ((_a = m.messages[0]) === null || _a === void 0 ? void 0 : _a.content) || null,
                                        lastMessageAt: ((_b = m.messages[0]) === null || _b === void 0 ? void 0 : _b.createdAt) || null,
                                        user: {
                                            id: matchedUser.id,
                                            username: matchedUser.username,
                                            profile: {
                                                name: (matchedUserProfile === null || matchedUserProfile === void 0 ? void 0 : matchedUserProfile.name) || null,
                                                age: (matchedUserProfile === null || matchedUserProfile === void 0 ? void 0 : matchedUserProfile.age) || null,
                                                interests: (matchedUserProfile === null || matchedUserProfile === void 0 ? void 0 : matchedUserProfile.interests) || [],
                                                photoUrl: ((_c = matchedUserProfile === null || matchedUserProfile === void 0 ? void 0 : matchedUserProfile.photos[0]) === null || _c === void 0 ? void 0 : _c.url) || null,
                                            },
                                        },
                                    };
                                })];
                    }
                });
            });
        };
        SwipesService_1.prototype.undoLastSwipe = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var lastSwipe, match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.swipe.findFirst({
                                where: { swiperId: userId },
                                orderBy: { createdAt: 'desc' },
                            })];
                        case 1:
                            lastSwipe = _a.sent();
                            if (!lastSwipe) {
                                throw new common_1.NotFoundException('No swipe to undo');
                            }
                            return [4 /*yield*/, this.prisma.match.findFirst({
                                    where: {
                                        OR: [
                                            { initiatorId: userId, targetId: lastSwipe.swipedId },
                                            { initiatorId: lastSwipe.swipedId, targetId: userId },
                                        ],
                                    },
                                })];
                        case 2:
                            match = _a.sent();
                            if (match) {
                                throw new common_1.ForbiddenException('Cannot undo swipe after match formed');
                            }
                            return [4 /*yield*/, this.prisma.swipe.delete({ where: { id: lastSwipe.id } })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { success: true, message: 'Swipe undone' }];
                    }
                });
            });
        };
        SwipesService_1.prototype.unmatch = function (userId, matchedUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var match;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.match.findFirst({
                                where: {
                                    OR: [
                                        { initiatorId: userId, targetId: matchedUserId },
                                        { initiatorId: matchedUserId, targetId: userId },
                                    ],
                                },
                            })];
                        case 1:
                            match = _a.sent();
                            if (!match) {
                                throw new common_1.NotFoundException('Match not found');
                            }
                            return [4 /*yield*/, this.prisma.match.delete({ where: { id: match.id } })];
                        case 2:
                            _a.sent();
                            this.prisma.matchScore.deleteMany({
                                where: {
                                    OR: [
                                        { userAId: userId, userBId: matchedUserId },
                                        { userAId: matchedUserId, userBId: userId },
                                    ],
                                },
                            });
                            return [2 /*return*/, { success: true, message: 'Unmatched successfully' }];
                    }
                });
            });
        };
        return SwipesService_1;
    }());
    __setFunctionName(_classThis, "SwipesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SwipesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SwipesService = _classThis;
}();
exports.SwipesService = SwipesService;
