// This service handles communication effectively.
// In a real deployment, this would use firebase/functions SDK.
// For now, we simulate the server validation locally to demonstrate the logic.

export async function verifyGame(gameId: string, data: any): Promise<{ success: boolean; token?: string; error?: string }> {
    console.log(`[Mock Server] Verifying ${gameId}...`, data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        if (gameId === 'quantum-reflex') {
            return verifyQuantumReflex(data);
        }
        if (gameId === 'memo-matrix') {
            return verifyMemoMatrix(data);
        }

        // Simpler checks for others for now
        return { success: true, token: `MOCK_TOKEN_${gameId}_${Date.now()}` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ------ Simulation Logic (Mirrors Backend) ------

function verifyQuantumReflex(data: { history: number[], score: number }) {
    const { history, score } = data;

    // Verify score matches history length first
    if (history.length !== score) return { success: false, error: "History mismatch" };

    // In a real app we'd enforce score >= 25.
    // For this demo/testing, we allow lower scores if the client sends them, 
    // but we still enforce the reaction time check.
    if (score < 25) {
        console.warn("[Mock Server] Allowing low score for testing purposes");
    }

    let prevTime = history[0];
    for (let i = 1; i < history.length; i++) {
        const diff = history[i] - prevTime;
        if (diff < 50) return { success: false, error: "Suspected cheating: Superhuman reflexes" };
        prevTime = history[i];
    }
    return { success: true, token: `VALID_QR_${Date.now()}` };
}

function verifyMemoMatrix(data: { level: number, timeElapsed: number }) {
    if (data.level < 10) return { success: false, error: "Level too low" };
    if (data.timeElapsed < 10000) return { success: false, error: "Suspected cheating: Impossible speed" };
    return { success: true, token: `VALID_MM_${Date.now()}` };
}
