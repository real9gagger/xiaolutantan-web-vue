export default {
    state(){
    	return {
    		authToken:  "", //令牌信息
            userName:   "", //账号
            nickName:   "", //昵称
            avatarUrl:  "", //头像URL
            readPostIds: [], //用户已查看的帖子的ID，下次重新进首页时会清空。
    	}
    },
    mutations: {
        SET_USER_INFO(state, payload){
            state.authToken = (payload?.authToken || "");
            state.userName  = (payload?.userName  || "");
            state.nickName  = (payload?.nickName  || "");
            state.avatarUrl = (payload?.avatarUrl || "");
        },
        ADD_READ_POST_ID(state, payload){
            if(payload && state.readPostIds.indexOf(payload) < 0){
                state.readPostIds.push(payload);
            }
        },
        CLEAR_READ_POST_ID(state, payload){
            if(!payload){
                if(state.readPostIds.length){
                    state.readPostIds.splice(0);
                }
            } else {
                const idx = state.readPostIds.indexOf(payload);
                if(idx >= 0){
                    state.readPostIds.splice(idx, 0);
                }
            }
        }
    },
    actions: {
        setUserInfo({ commit }, payload){
            commit("SET_USER_INFO", payload);
        },
        addReadPostId({ commit }, payload){
            commit("ADD_READ_POST_ID", payload);
        },
        clearReadPostId({ commit }, payload){
            commit("CLEAR_READ_POST_ID", payload);
        }
    }
}