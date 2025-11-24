import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

export const handler = async (event) => {
  console.log('[Lambda] Event:', JSON.stringify(event, null, 2));
  
  try {
    const detail = event.detail || {};
    const { userId, creditsToAdd } = detail;
    
    if (!userId || !creditsToAdd) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Faltan parámetros' })
      };
    }
    
    console.log(`[Lambda] Adding ${creditsToAdd} credits to user ${userId}`);
    
    const query = `UPDATE user_credits SET credits = credits + $1, updated_at = NOW() WHERE user_id = $2 RETURNING *`;
    const result = await pool.query(query, [creditsToAdd, userId]);
    
    if (result.rows.length === 0) {
      console.log(`[Lambda] User not found, creating`);
      const insertQuery = `INSERT INTO user_credits (user_id, credits) VALUES ($1, $2) RETURNING *`;
      const insertResult = await pool.query(insertQuery, [userId, creditsToAdd]);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Usuario creado', credits: insertResult.rows[0].credits })
      };
    }
    
    console.log(`[Lambda] New balance: ${result.rows[0].credits}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Créditos actualizados', credits: result.rows[0].credits })
    };
    
  } catch (error) {
    console.error('[Lambda] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error', error: error.message })
    };
  }
};
