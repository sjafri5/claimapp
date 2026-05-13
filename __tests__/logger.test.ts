import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages to console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test message");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("INFO");
    expect(spy.mock.calls[0][0]).toContain("test message");
  });

  it("logs error messages to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("something failed");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("ERROR");
    expect(spy.mock.calls[0][0]).toContain("something failed");
  });

  it("logs warn messages to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("be careful");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("WARN");
  });

  it("includes ISO timestamp in output", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("time check");
    const output = spy.mock.calls[0][0] as string;
    expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("serializes data objects as JSON", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("with data", { userId: "123", count: 5 });
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain('"userId":"123"');
    expect(output).toContain('"count":5');
  });

  it("serializes Error objects with message and stack", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("test error");
    logger.error("caught error", err);
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain('"error":"test error"');
    expect(output).toContain('"stack"');
  });
});
