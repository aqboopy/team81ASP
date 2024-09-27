const request = require("supertest");
const app = require("../../index");
const { expect } = require("chai");

describe("Market Route", () => {
	it("should return the list of products with status 200", (done) => {
		request(app)
			.get("/market")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				// Expecting an array
				expect(res.body).to.be.an("object"); // Ensure your route returns an array
				done();
			});
	});
});
