import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления сферами жизни (просмотр, создание, редактирование, удаление)
    Args: event с httpMethod, body, queryStringParameters, pathParams
    Returns: JSON с данными сфер или результатом операции
    '''
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            sphere_id = event.get('queryStringParameters', {}).get('id')
            
            if sphere_id:
                cursor.execute("SELECT * FROM life_spheres WHERE id = %s", (sphere_id,))
                sphere = cursor.fetchone()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(dict(sphere) if sphere else None)
                }
            else:
                cursor.execute("SELECT * FROM life_spheres ORDER BY created_at DESC")
                spheres = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(s) for s in spheres], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            icon = body_data.get('icon', 'Circle')
            color = body_data.get('color', '#8B5CF6')
            
            cursor.execute(
                "INSERT INTO life_spheres (name, icon, color) VALUES (%s, %s, %s) RETURNING *",
                (name, icon, color)
            )
            new_sphere = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_sphere), default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            sphere_id = body_data.get('id')
            name = body_data.get('name')
            icon = body_data.get('icon')
            color = body_data.get('color')
            
            cursor.execute(
                "UPDATE life_spheres SET name = %s, icon = %s, color = %s WHERE id = %s RETURNING *",
                (name, icon, color, sphere_id)
            )
            updated_sphere = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_sphere) if updated_sphere else None, default=str)
            }
        
        elif method == 'DELETE':
            sphere_id = event.get('queryStringParameters', {}).get('id')
            
            cursor.execute("DELETE FROM life_spheres WHERE id = %s", (sphere_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': sphere_id})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
