const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const {
  registerUser,
  loginUser,
} = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json(
      new ApiResponse(400, "All fields are required")
    );
  }

  const user = await registerUser(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully",
      user
    )
  );
});

const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);

  res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      data
    )
  );
});

module.exports = {
  register,
  login,
};