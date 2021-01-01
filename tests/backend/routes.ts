import {getInstanceRouter} from "xpresser";

const router = getInstanceRouter();

router.get('/users', 'UserController@users').name('users');
router.post('/users', 'UserController@create').name('user.create');

router.get('/user/:userId', 'UserController@user').name('user');
router.patch('/user/:userId', 'UserController@update').name('user.update');
router.delete('/user/:userId', 'UserController@delete').name('user.delete');

router.get('/songs/:genre/:year?/:month?/:day?', 'UserController@songs').name('songs');