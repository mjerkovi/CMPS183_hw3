# These are the controllers for your ajax api.
from aetypes import end

def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])

def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    posts = []
    has_more = False
    rows = db().select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=~db.post.created_on)
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                user_email = r.user_email,
                post_content = r.post_content,
                created_on = r.created_on.strftime("%B %d 20%y   %H:%M:%S"),
                updated_on = r.updated_on.strftime("%B %d 20%y   %H:%M:%S"),
                user_name = get_user_name_from_email(r.user_email),
            )
            posts.append(t)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    loggedin_user_email = auth.user.email if auth.user_id else None
    return response.json(dict(
            posts = posts,
            logged_in = logged_in,
            has_more = has_more,
            loggedin_user_email = loggedin_user_email,
        ))

@auth.requires_signature()
def add_post():
    #inserts post into the the database then returns the post as a dictionary
    p_id = db.post.insert(
        post_content = request.vars.post_content
    )
    p = db.post(p_id)
    t = dict(
        id=p.id,
        user_email=p.user_email,
        post_content=p.post_content,
        created_on=p.created_on.strftime("%B %d 20%y   %H:%M:%S"),
        updated_on=p.updated_on.strftime("%B %d 20%y   %H:%M:%S"),
        user_name=get_user_name_from_email(p.user_email),
    )
    return response.json(dict(post=t))


@auth.requires_signature()
def del_post():
    #deletes post and return "ok" = 200
    db(db.post.id == request.vars.post_id).delete()
    return "ok"

@auth.requires_signature()
def edit_post():
    #updates the post in the database then returns the new updated post as a dictionary
    row = db(db.post.id == request.vars.post_id).select().first()
    row.update_record(post_content=request.vars.edit_content)
    p = db.post(request.vars.post_id)
    t = dict(
        id=p.id,
        user_email=p.user_email,
        post_content=p.post_content,
        created_on=p.created_on.strftime("%B %d 20%y   %H:%M:%S"),
        updated_on=p.updated_on.strftime("%B %d 20%y   %H:%M:%S"),
        user_name=get_user_name_from_email(p.user_email),
    )
    return response.json(dict(post=t))


