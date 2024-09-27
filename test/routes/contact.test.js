const request = require("supertest");
const app = require("../../index");

describe("Contact Route", function () {
	this.timeout(5000); // Increase timeout for async tests
	it("should submit a contact form and return status 200", (done) => {
		request(app)
			.post("/contact")
			.send({ name: "John Doe", message: "Need help" }) // Mock contact form data
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
