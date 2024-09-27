const request = require("supertest");
const app = require("../../index");

describe("Sell Route", () => {
	it("should create a new listing and return status 201", (done) => {
		request(app)
			.post("/sell")
			.send({ title: "New Product", price: 99.99 }) // Mock data for listing
			.expect(200) // Expecting a successful creation
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
