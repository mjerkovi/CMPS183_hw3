// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_post_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        }
        console.log(get_posts_url + "?" + $.param(pp))
        return get_posts_url + "?" + $.param(pp)
    }

    //only called initially
    self.get_posts = function () {
       $.getJSON(get_post_url(0, 4), function(data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })

    };

    //loads four more posts
    self.get_more = function () {
        var num_posts = self.vue.posts.length
        $.getJSON(get_post_url(num_posts, num_posts + 4), function(data){
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
        })
    };

    self.add_post_button = function() {
        self.vue.is_adding_post = !self.vue.is_adding_post;
    }

    //uses ajax to add a post to the post database, then the post is returned from the
    //server once added to the database. it is then added to the front of the post list
    self.add_post = function () {
        $.post(add_post_url,
            {
                post_content: self.vue.form_content
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.posts.unshift(data.post);
            }
        )
    }

    self.delete_post = function(post_id) {

        $.post(del_post_url,
            {
                post_id: post_id
            },
            function () {
                var idx = null;
                for(var i = 0; i < self.vue.posts.length; i++) {
                    if (post_id === self.vue.posts[i].id){
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                        self.vue.posts.splice(idx - 1, 1);
                }
            }
        )
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            posts: [],
            has_more: false,
            is_adding_post: false,
            form_content: null
        },
        methods: {
            get_more: self.get_more,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            delete_post: self.delete_post
        }

    });

    //uncomment when all this shit works
    self.get_posts();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
