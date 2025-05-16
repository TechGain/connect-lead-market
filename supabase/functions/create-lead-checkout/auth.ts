
import { logStep } from "./utils.ts";

// Authenticate user with token
export const authenticateUser = async (token: string, supabaseClient: any) => {
  logStep("Authenticating with token", { tokenLength: token.length });
  
  try {
    const { data, error } = await supabaseClient.auth.getUser(token);
    if (error) {
      logStep("Authentication error", { error });
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    const user = data.user;
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });
    return user;
  } catch (e) {
    const error = "Failed to authenticate user: " + e.message;
    logStep("ERROR: " + error);
    throw new Error(error);
  }
};

// Fetch lead data
export const fetchLead = async (leadId: string, supabaseAdmin: any) => {
  logStep("Fetching lead data", { leadId });
  
  try {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error) {
      logStep("Lead fetch error", { error });
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("Lead not found");
    }
    
    // Ensure the lead is available for purchase
    if (data.status !== 'new') {
      throw new Error(`Lead is not available for purchase (status: ${data.status})`);
    }
    
    logStep("Lead fetched successfully", { leadId: data.id, price: data.price, type: data.type });
    return data;
  } catch (e) {
    const error = "Failed to fetch lead: " + e.message;
    logStep("ERROR: " + error);
    throw new Error(error);
  }
};
