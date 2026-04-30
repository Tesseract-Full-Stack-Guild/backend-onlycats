"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingService = void 0;
var common_1 = require("@nestjs/common");
var MatchingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MatchingService = _classThis = /** @class */ (function () {
        function MatchingService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(MatchingService.name);
            this.interestFrequencies = {};
            this.totalUsersWithInterests = 0;
        }
        MatchingService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.precomputeInterestFrequencies()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Precompute global interest frequencies for IDF weighting
         * weight_i = 1 / log(frequency_i + 1)
         * Called on module init and can be refreshed periodically
         */
        MatchingService_1.prototype.precomputeInterestFrequencies = function () {
            return __awaiter(this, void 0, void 0, function () {
                var allProfiles, frequencies, _i, allProfiles_1, profile, uniqueInterests, _a, uniqueInterests_1, interest;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.logger.log('Precomputing interest frequencies...');
                            return [4 /*yield*/, this.prisma.profile.findMany({
                                    select: { interests: true },
                                })];
                        case 1:
                            allProfiles = _b.sent();
                            frequencies = {};
                            this.totalUsersWithInterests = 0;
                            for (_i = 0, allProfiles_1 = allProfiles; _i < allProfiles_1.length; _i++) {
                                profile = allProfiles_1[_i];
                                if (profile.interests && profile.interests.length > 0) {
                                    this.totalUsersWithInterests++;
                                    uniqueInterests = new Set(profile.interests);
                                    for (_a = 0, uniqueInterests_1 = uniqueInterests; _a < uniqueInterests_1.length; _a++) {
                                        interest = uniqueInterests_1[_a];
                                        frequencies[interest] = (frequencies[interest] || 0) + 1;
                                    }
                                }
                            }
                            this.interestFrequencies = frequencies;
                            this.logger.log("Computed frequencies for ".concat(Object.keys(frequencies).length, " unique interests from ").concat(this.totalUsersWithInterests, " profiles"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get weight for a given interest using IDF formula
         */
        MatchingService_1.prototype.getInterestWeight = function (interest) {
            var freq = this.interestFrequencies[interest] || 1;
            return 1 / Math.log(freq + 1);
        };
        /**
         * Weighted Jaccard similarity
         * score = sum(weights of shared interests) / sum(weights of union of interests)
         * Returns value between 0 and 1
         */
        MatchingService_1.prototype.weightedJaccard = function (interestsA, interestsB) {
            if (!interestsA.length || !interestsB.length)
                return 0;
            var setA = new Set(interestsA);
            var setB = new Set(interestsB);
            var intersectionWeight = 0;
            var unionWeight = 0;
            var allInterests = new Set(__spreadArray(__spreadArray([], setA, true), setB, true));
            for (var _i = 0, allInterests_1 = allInterests; _i < allInterests_1.length; _i++) {
                var interest = allInterests_1[_i];
                var weight = this.getInterestWeight(interest);
                unionWeight += weight;
                var inA = setA.has(interest);
                var inB = setB.has(interest);
                if (inA && inB) {
                    intersectionWeight += weight;
                }
            }
            return unionWeight > 0 ? intersectionWeight / unionWeight : 0;
        };
        /**
         * Dorm boost calculation
         * Same building: +0.15
         * Same complex/area (partial match): +0.05
         * Otherwise: 0
         */
        MatchingService_1.prototype.calculateDormBoost = function (dormA, dormB) {
            if (!dormA || !dormB)
                return 0;
            var dormAStr = dormA.toString().toLowerCase().trim();
            var dormBStr = dormB.toString().toLowerCase().trim();
            // Exact match → same building
            if (dormAStr === dormBStr) {
                return 0.15;
            }
            // Check for same complex (first word match, e.g., "Stirling Hall" vs "Stirling Tower")
            var partsA = dormAStr.split(' ');
            var partsB = dormBStr.split(' ');
            for (var _i = 0, partsA_1 = partsA; _i < partsA_1.length; _i++) {
                var partA = partsA_1[_i];
                for (var _a = 0, partsB_1 = partsB; _a < partsB_1.length; _a++) {
                    var partB = partsB_1[_a];
                    if (partA && partB && partA === partB && partA.length > 3) {
                        return 0.05; // same complex/area
                    }
                }
            }
            return 0;
        };
        /**
         * Recency boost: +0.10 if active in last 48 hours
         */
        MatchingService_1.prototype.calculateRecencyBoost = function (lastActive) {
            var now = new Date();
            var hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
            return hoursSinceActive <= 48 ? 0.1 : 0;
        };
        /**
         * Main matching algorithm
         * Returns score 0-1 with all boosts and randomization
         */
        MatchingService_1.prototype.calculateMatchScore = function (profileA, profileB, userAActive, userBActive) {
            return __awaiter(this, void 0, void 0, function () {
                var interestSimilarity, interestScore, majorBoost, dormBoost, yearBoost, moreRecentActive, recencyBoost, rawScore, clampedRaw, randomNoise, finalScore;
                return __generator(this, function (_a) {
                    interestSimilarity = this.weightedJaccard(profileA.interests || [], profileB.interests || []);
                    interestScore = interestSimilarity * 0.6;
                    majorBoost = 0;
                    if (profileA.sameMajorOnly && profileA.major && profileB.major) {
                        if (profileA.major.toLowerCase() === profileB.major.toLowerCase()) {
                            majorBoost = 0.2; // cap at 0.2 when enabled
                        }
                        // If sameMajorOnly is true but majors don't match, score will be 0 or very low
                    }
                    dormBoost = this.calculateDormBoost(profileA.dorm, profileB.dorm);
                    yearBoost = profileA.year && profileA.year === profileB.year ? 0.05 : 0;
                    moreRecentActive = userAActive > userBActive ? userAActive : userBActive;
                    recencyBoost = this.calculateRecencyBoost(moreRecentActive);
                    rawScore = interestScore + majorBoost + dormBoost + yearBoost + recencyBoost;
                    clampedRaw = Math.max(0, Math.min(1, rawScore));
                    randomNoise = Math.random() * 0.15;
                    finalScore = clampedRaw * 0.85 + randomNoise;
                    return [2 /*return*/, {
                            score: Math.min(1, finalScore),
                            breakdown: {
                                interestScore: interestScore,
                                majorBoost: majorBoost,
                                dormBoost: dormBoost,
                                yearBoost: yearBoost,
                                recencyBoost: recencyBoost,
                                randomFactor: randomNoise,
                            },
                        }];
                });
            });
        };
        /**
         * Get top N matches for a user
         * Uses candidate filtering + scoring + caching
         */
        MatchingService_1.prototype.getMatches = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, limit) {
                var userProfile, whereClause, candidates, scoredMatches, filtered;
                var _this = this;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.profile.findUnique({
                                where: { userId: userId },
                                include: { user: { select: { lastActive: true } } },
                            })];
                        case 1:
                            userProfile = _a.sent();
                            if (!userProfile) {
                                throw new Error('Profile not found for user');
                            }
                            whereClause = {
                                userId: { not: userId },
                            };
                            // Gender filter based on seeking
                            if (userProfile.seeking !== 'EVERYONE') {
                                whereClause.gender = userProfile.seeking;
                            }
                            // If sameMajorOnly is ON, filter by same major
                            if (userProfile.sameMajorOnly && userProfile.major) {
                                whereClause.major = userProfile.major;
                            }
                            return [4 /*yield*/, this.prisma.profile.findMany({
                                    where: whereClause,
                                    take: 500, // tune based on population size
                                    include: {
                                        user: { select: { lastActive: true } },
                                    },
                                })];
                        case 2:
                            candidates = _a.sent();
                            this.logger.log("Computing scores for ".concat(candidates.length, " candidates"));
                            return [4 /*yield*/, Promise.all(candidates.map(function (candidate) { return __awaiter(_this, void 0, void 0, function () {
                                    var _a, score, breakdown;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, this.calculateMatchScore(userProfile, candidate, userProfile.user.lastActive, candidate.user.lastActive)];
                                            case 1:
                                                _a = _b.sent(), score = _a.score, breakdown = _a.breakdown;
                                                return [2 /*return*/, __assign(__assign({}, candidate), { matchScore: score, scoreBreakdown: breakdown })];
                                        }
                                    });
                                }); }))];
                        case 3:
                            scoredMatches = _a.sent();
                            filtered = scoredMatches
                                .filter(function (m) { return m.matchScore >= 0.1; }) // minimum threshold
                                .sort(function (a, b) { return b.matchScore - a.matchScore; })
                                .slice(0, limit);
                            // 6. Cache scores in bulk (upsert)
                            return [4 /*yield*/, this.bulkUpsertMatchScores(userId, filtered)];
                        case 4:
                            // 6. Cache scores in bulk (upsert)
                            _a.sent();
                            this.logger.log("Returning top ".concat(filtered.length, " matches"));
                            return [2 /*return*/, filtered];
                    }
                });
            });
        };
        /**
         * Batch upsert match scores
         */
        MatchingService_1.prototype.bulkUpsertMatchScores = function (userId, matches) {
            return __awaiter(this, void 0, void 0, function () {
                var now, updates, _i, updates_1, update;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = new Date();
                            updates = matches.map(function (m) { return ({
                                where: { userAId_userBId: { userAId: userId, userBId: m.userId } },
                                update: {
                                    score: m.matchScore,
                                    interestScore: m.scoreBreakdown.interestScore,
                                    majorBoost: m.scoreBreakdown.majorBoost,
                                    dormBoost: m.scoreBreakdown.dormBoost,
                                    yearBoost: m.scoreBreakdown.yearBoost,
                                    recencyBoost: m.scoreBreakdown.recencyBoost,
                                    randomFactor: m.scoreBreakdown.randomFactor,
                                    lastCalculated: now,
                                },
                                create: {
                                    userAId: userId,
                                    userBId: m.userId,
                                    score: m.matchScore,
                                    interestScore: m.scoreBreakdown.interestScore,
                                    majorBoost: m.scoreBreakdown.majorBoost,
                                    dormBoost: m.scoreBreakdown.dormBoost,
                                    yearBoost: m.scoreBreakdown.yearBoost,
                                    recencyBoost: m.scoreBreakdown.recencyBoost,
                                    randomFactor: m.scoreBreakdown.randomFactor,
                                },
                            }); });
                            _i = 0, updates_1 = updates;
                            _a.label = 1;
                        case 1:
                            if (!(_i < updates_1.length)) return [3 /*break*/, 4];
                            update = updates_1[_i];
                            return [4 /*yield*/, this.prisma.matchScore.upsert(update)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get cached matches (faster, no recomputation)
         */
        MatchingService_1.prototype.getCachedMatches = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, limit) {
                var scores, profiles, scoreMap, result;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.matchScore.findMany({
                                where: { userAId: userId },
                                orderBy: { score: 'desc' },
                                take: limit,
                            })];
                        case 1:
                            scores = _a.sent();
                            if (scores.length === 0) {
                                return [2 /*return*/, this.getMatches(userId, limit)];
                            }
                            return [4 /*yield*/, this.prisma.profile.findMany({
                                    where: { userId: { in: scores.map(function (s) { return s.userBId; }) } },
                                    include: { user: { select: { lastActive: true } } },
                                })];
                        case 2:
                            profiles = _a.sent();
                            scoreMap = new Map(scores.map(function (s) { return [s.userBId, s]; }));
                            result = profiles
                                .map(function (profile) {
                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                                return (__assign(__assign({}, profile), { matchScore: (_b = (_a = scoreMap.get(profile.userId)) === null || _a === void 0 ? void 0 : _a.score) !== null && _b !== void 0 ? _b : 0, scoreBreakdown: {
                                        interestScore: (_d = (_c = scoreMap.get(profile.userId)) === null || _c === void 0 ? void 0 : _c.interestScore) !== null && _d !== void 0 ? _d : 0,
                                        majorBoost: (_f = (_e = scoreMap.get(profile.userId)) === null || _e === void 0 ? void 0 : _e.majorBoost) !== null && _f !== void 0 ? _f : 0,
                                        dormBoost: (_h = (_g = scoreMap.get(profile.userId)) === null || _g === void 0 ? void 0 : _g.dormBoost) !== null && _h !== void 0 ? _h : 0,
                                        yearBoost: (_k = (_j = scoreMap.get(profile.userId)) === null || _j === void 0 ? void 0 : _j.yearBoost) !== null && _k !== void 0 ? _k : 0,
                                        recencyBoost: (_m = (_l = scoreMap.get(profile.userId)) === null || _l === void 0 ? void 0 : _l.recencyBoost) !== null && _m !== void 0 ? _m : 0,
                                        randomFactor: (_p = (_o = scoreMap.get(profile.userId)) === null || _o === void 0 ? void 0 : _o.randomFactor) !== null && _p !== void 0 ? _p : 0,
                                    } }));
                            })
                                .filter(function (m) { return m.matchScore > 0; })
                                .sort(function (a, b) { return b.matchScore - a.matchScore; });
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Invalidate cache for a user (call when profile updates)
         */
        MatchingService_1.prototype.invalidateUserCache = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.matchScore.deleteMany({
                                where: {
                                    OR: [{ userAId: userId }, { userBId: userId }],
                                },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Refresh frequencies (call periodically as new users join)
         */
        MatchingService_1.prototype.refreshFrequencies = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.precomputeInterestFrequencies()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return MatchingService_1;
    }());
    __setFunctionName(_classThis, "MatchingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MatchingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MatchingService = _classThis;
}();
exports.MatchingService = MatchingService;
