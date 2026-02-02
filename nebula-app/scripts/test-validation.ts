import { signupSchema, registerSchema, signinSchema } from "../src/lib/validations";
import { UserRole } from "../generated/prisma";
import { z } from "zod";

function testSchema(name: string, schema: z.ZodSchema, data: any) {
  console.log(`Testing ${name}...`);
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      console.log("✅ Success");
    } else {
      console.log("❌ Failed as expected:");
      result.error.errors.forEach((err) => {
        console.log(`  - [${err.path.join(".")}] ${err.message}`);
      });
    }
  } catch (error) {
    console.error("🔥 Unexpected error:", error);
  }
  console.log("---");
}

console.log("Starting Validation Tests...\n");

// Valid Student Signup
testSchema("Valid Student Signup", signupSchema, {
  email: "student@example.com",
  password: "Password123!",
  fullName: "Jane Doe",
  role: UserRole.STUDENT
});

// Invalid Registration (missing special character, short name)
testSchema("Invalid Registration (Weak Password, Short Name)", registerSchema, {
  email: "coach@example.com",
  password: "password",
  fullName: "J",
  role: UserRole.COACH
});

// Invalid Signin (invalid email)
testSchema("Invalid Signin (Invalid Email, Missing Password)", signinSchema, {
  email: "invalid-email",
  password: ""
});

console.log("Tests Completed.");
