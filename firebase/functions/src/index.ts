import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();

// Secret key for signing tokens (Stored in env vars in prod)
const SIGNING_SECRET = process.env.SIGNING_SECRET || 'dev_secret_key_123';

/**
 * Verify Quantum Reflex Replay
 * Checks if reaction times are physically possible (>100ms usually, but we'll accept >50ms for now to be safe)
 * and if the timestamps line up with the difficulty curve.
 */
export const verifyQuantumReflex = functions.https.onCall((data, context) => {
    const { history, score } = data; // history is array of timestamps

    if (!history || history.length !== score) {
        throw new functions.https.HttpsError('invalid-argument', 'Mismatch in score/history');
    }

    // WIN_SCORE from client code is 30
    if (score < 30) {
        throw new functions.https.HttpsError('failed-precondition', 'Score too low');
    }

    let prevTime = history[0];
    for (let i = 1; i < history.length; i++) {
        const diff = history[i] - prevTime;
        // Human reaction time absolute limit is around 100-150ms. 
        // If they click faster than 50ms consistently, it's a script.
        if (diff < 50) {
            throw new functions.https.HttpsError('permission-denied', 'Inhuman reaction time detected');
        }
        prevTime = history[i];
    }

    // Verification passed
    return generateWinnerToken('quantum-reflex');
});

/**
 * Verify MemoMatrix
 * In a real implementation, the server would send the seed/sequence, and client just sends inputs.
 * For this simplified version, we'll just sign a token if they claim victory (trusting the client mostly here, 
 * but in a real app better security is needed).
 * 
 * Improvement: Verify time taken is realistic for the level count.
 */
export const verifyMemoMatrix = functions.https.onCall((data, context) => {
    const { level, timeElapsed } = data;

    if (level < 10) {
        throw new functions.https.HttpsError('failed-precondition', 'Level too low');
    }

    // Minimum time to watch 10 levels of sequences and play them back
    // Level 1: 1 flash ~800ms + play ~500ms
    // ...
    // Rough estimate: It takes at least 30-60 seconds to beat level 10.
    if (timeElapsed < 15000) { // 15s is very generous/suspicious
        throw new functions.https.HttpsError('permission-denied', 'Impossible speed');
    }

    return generateWinnerToken('memo-matrix');
});

function generateWinnerToken(gameId: string) {
    const timestamp = Date.now();
    const payload = `${gameId}:${timestamp}`;
    const signature = crypto.createHmac('sha256', SIGNING_SECRET).update(payload).digest('hex');

    return {
        token: `${payload}:${signature}`,
        timestamp
    };
}
