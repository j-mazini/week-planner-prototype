import { afterEach, describe, expect, it, vi } from "vitest";
import { installApiFetchCredentials } from "./installApiFetchCredentials";

const originalFetch = window.fetch;
afterEach(() => {
  window.fetch = originalFetch;
  delete window.__logixSphereApiFetchCredentialsInstalled;
});

describe("offline fetch interception", () => {
  it("never sends API calls to the network and preserves Request methods", async () => {
    const network = vi.fn();
    window.fetch = network;
    installApiFetchCredentials();
    const response = await window.fetch(new Request("http://mock.local/api/mock/bff/vendor", { method: "POST" }));
    expect(await response.json()).toMatchObject({ success: true });
    expect(network).not.toHaveBeenCalled();
  });

  it("leaves static resources alone and installs once", async () => {
    const network = vi.fn().mockResolvedValue(new Response("asset"));
    window.fetch = network;
    installApiFetchCredentials();
    const wrapper = window.fetch;
    installApiFetchCredentials();
    expect(window.fetch).toBe(wrapper);
    await window.fetch("/route-balance/screens/example.json");
    expect(network).toHaveBeenCalledWith("/route-balance/screens/example.json", undefined);
  });
});
