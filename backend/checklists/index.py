import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления чек-листами (просмотр, создание, редактирование, удаление)
    Args: event с httpMethod, body, queryStringParameters
    Returns: JSON с данными чек-листов или результатом операции
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
            checklist_id = event.get('queryStringParameters', {}).get('id')
            
            if checklist_id:
                cursor.execute("""
                    SELECT c.*, s.name as sphere_name, s.color as sphere_color, s.icon as sphere_icon,
                           COUNT(t.id) as tasks_count
                    FROM checklists c
                    LEFT JOIN life_spheres s ON c.sphere_id = s.id
                    LEFT JOIN tasks t ON t.checklist_id = c.id
                    WHERE c.id = %s
                    GROUP BY c.id, s.name, s.color, s.icon
                """, (checklist_id,))
                checklist = cursor.fetchone()
                
                if checklist:
                    cursor.execute("""
                        SELECT * FROM tasks 
                        WHERE checklist_id = %s 
                        ORDER BY created_at ASC
                    """, (checklist_id,))
                    tasks = cursor.fetchall()
                    result = dict(checklist)
                    result['tasks'] = [dict(t) for t in tasks]
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(result, default=str)
                    }
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Not found'})
                }
            else:
                cursor.execute("""
                    SELECT c.*, s.name as sphere_name, s.color as sphere_color, s.icon as sphere_icon,
                           COUNT(t.id) as tasks_count
                    FROM checklists c
                    LEFT JOIN life_spheres s ON c.sphere_id = s.id
                    LEFT JOIN tasks t ON t.checklist_id = c.id
                    GROUP BY c.id, s.name, s.color, s.icon
                    ORDER BY c.created_at DESC
                """)
                checklists = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(ch) for ch in checklists], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title')
            description = body_data.get('description', '')
            sphere_id = body_data.get('sphere_id')
            
            cursor.execute(
                "INSERT INTO checklists (title, description, sphere_id) VALUES (%s, %s, %s) RETURNING *",
                (title, description, sphere_id)
            )
            new_checklist = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_checklist), default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            checklist_id = body_data.get('id')
            title = body_data.get('title')
            description = body_data.get('description')
            sphere_id = body_data.get('sphere_id')
            
            cursor.execute(
                "UPDATE checklists SET title = %s, description = %s, sphere_id = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                (title, description, sphere_id, checklist_id)
            )
            updated_checklist = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_checklist) if updated_checklist else None, default=str)
            }
        
        elif method == 'DELETE':
            checklist_id = event.get('queryStringParameters', {}).get('id')
            
            cursor.execute("DELETE FROM checklists WHERE id = %s", (checklist_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': checklist_id})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
