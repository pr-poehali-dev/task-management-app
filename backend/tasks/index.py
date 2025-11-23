import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления задачами в чек-листах (создание, обновление, удаление)
    Args: event с httpMethod, body, queryStringParameters
    Returns: JSON с данными задач или результатом операции
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
            checklist_id = event.get('queryStringParameters', {}).get('checklist_id')
            
            if checklist_id:
                cursor.execute("""
                    SELECT * FROM tasks 
                    WHERE checklist_id = %s 
                    ORDER BY created_at ASC
                """, (checklist_id,))
                tasks = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(t) for t in tasks], default=str)
                }
            
            cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
            tasks = cursor.fetchall()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(t) for t in tasks], default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title')
            description = body_data.get('description', '')
            checklist_id = body_data.get('checklist_id')
            sphere_id = body_data.get('sphere_id')
            priority = body_data.get('priority', 'medium')
            
            cursor.execute(
                "INSERT INTO tasks (title, description, checklist_id, sphere_id, priority) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (title, description, checklist_id, sphere_id, priority)
            )
            new_task = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_task), default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            task_id = body_data.get('id')
            title = body_data.get('title')
            description = body_data.get('description')
            is_completed = body_data.get('is_completed')
            priority = body_data.get('priority')
            
            cursor.execute(
                "UPDATE tasks SET title = %s, description = %s, is_completed = %s, priority = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                (title, description, is_completed, priority, task_id)
            )
            updated_task = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_task) if updated_task else None, default=str)
            }
        
        elif method == 'DELETE':
            task_id = event.get('queryStringParameters', {}).get('id')
            
            cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': task_id})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
