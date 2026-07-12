const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const userService = require('./user.service');

const register = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const user = await userService.registerUser(requester, req.body);
  res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

const getUsersByRole = catchAsync(async (req, res) => {
  const { role } = req.query;
  if (!role) throw new ApiError(400, 'role query param is required');

  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const users = await userService.getUsersByRole(requester, role);
  res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

const getMyChildren = catchAsync(async (req, res) => {
  const children = await userService.getMyChildren(req.user.id);
  res.status(200).json(new ApiResponse(200, children, 'Children fetched successfully'));
});

module.exports = { register, getMe, getUsersByRole, getMyChildren };


/*
===============================================================================
WHY DO WE USE CONTROLLER + SERVICE + REPOSITORY?
===============================================================================

If Service and Repository layers did not exist, the Controller would have to:

1. Read request data (req.body, req.user)
2. Validate business rules
3. Check if email already exists
4. Hash the password
5. Assign instituteId from the logged-in admin
6. Execute MongoDB queries (findOne, create, etc.)
7. Prepare the response
8. Handle errors

Example (without Service & Repository):

-------------------------------------------------

const existingUser = await User.findOne({ email });

if (existingUser) {
   return res.status(409).json(...);
}

const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
   ...
});

res.status(201).json(...);

-------------------------------------------------


const bcrypt = require("bcrypt");
const User = require("./user.model");

const register = async (req, res, next) => {
  try {
    // Logged in admin
    const requester = req.user;

    // Request body
    const {
      name,
      email,
      password,
      role,
      parentId,
      batchIds,
    } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // 2. Check institute
    if (!requester.instituteId) {
      return res.status(400).json({
        success: false,
        message: "Requesting user has no institute context",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      instituteId: requester.instituteId,
      parentId: parentId || null,
      batchIds: batchIds || [],
    });

    // 5. Response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
      },
    });

  } catch (err) {
    next(err);
  }
};

Problems:

❌ Controller becomes very large (100+ lines)
❌ Business logic gets mixed with HTTP logic
❌ Database queries are written directly in Controller
❌ Same code gets duplicated in multiple Controllers
❌ Difficult to maintain and test

Current Clean Architecture:

Request
   ↓
Controller  → Handles HTTP request & response only
   ↓
Service     → Handles business logic
   ↓
Repository  → Handles database operations
   ↓
MongoDB

Each layer has a single responsibility, making the code clean,
reusable, maintainable, and easier to test.
===============================================================================
*/