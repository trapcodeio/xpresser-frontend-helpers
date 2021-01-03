function handleRequest(...args: any[]) {
    
}

export default {
    get: {
        /**
         * **UserController@users**
         *
         * - `[users]`
         * - `GET: /users`
         */
        users: (...args: any[]) => handleRequest({
            method: 'get',
            path: '/users',
        }, args),
        /**
         * **UserController@user**
         *
         * - `[user]`
         * - `GET: /user/:userId`
         */
        user: (...args: any[]) => handleRequest({
            method: 'get',
            path: '/user/_??_',
        }, args),
        /**
         * **UserController@songs**
         *
         * - `[songs]`
         * - `GET: /songs/:genre/:year?/:month?/:day?`
         */
        songs: (...args: any[]) => handleRequest({
            method: 'get',
            path: '/songs/_??_/_??_/_??_/_??_',
        }, args),
    },
    post: {
        user: {
            /**
             * **UserController@create**
             *
             * - `[user.create]`
             * - `POST: /users`
             */
            create: (...args: any[]) => handleRequest({
                method: 'post',
                path: '/users',
            }, args),
        },
    },
    patch: {
        user: {
            /**
             * **UserController@update**
             *
             * - `[user.update]`
             * - `PATCH: /user/:userId`
             */
            update: (...args: any[]) => handleRequest({
                method: 'patch',
                path: '/user/_??_',
            }, args),
        },
    },
    delete: {
        user: {
            /**
             * **UserController@delete**
             *
             * - `[user.delete]`
             * - `DELETE: /user/:userId`
             */
            delete: (...args: any[]) => handleRequest({
                method: 'delete',
                path: '/user/_??_',
            }, args),
        },
    },
};