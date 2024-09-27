const { expect } = require("chai");
const authMiddleware = require("../../middleware/authMiddleware");

describe("Authentication Middleware", () => {
	it("should call next if user is authenticated", (done) => {
		const req = {
			session: { userdata: { id: 1, username: "JacksonWang" } },
		}; // Mock userdata
		const res = {};
		const next = () => {
			done(); // Pass the test if next is called
		};

		authMiddleware(req, res, next);
	});

	it("should return 401 if user is not authenticated", (done) => {
		const req = { session: {} }; // No userdata
		const res = {
			status: (statusCode) => {
				expect(statusCode).to.equal(401);
				return {
					send: () => done(),
				};
			},
			redirect: () => done(), // Mock the redirect function
		};
		const next = () => {};

		authMiddleware(req, res, next);
	});
});
