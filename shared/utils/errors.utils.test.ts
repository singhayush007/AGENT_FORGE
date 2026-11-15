import { describe, expect, it } from "vitest";
import { friendlyMessage } from "@/shared/utils/errors.utils";

describe("friendlyMessage", () => {
  it("keeps useful messages", () => {
    expect(friendlyMessage(new Error("This file is not valid"))).toBe("This file is not valid");
  });

  it("hides Next's generic production wrapper", () => {
    const e = new Error("An error occurred in the Server Components render.");
    expect(friendlyMessage(e)).toMatch(/something went wrong/i);
  });
});
