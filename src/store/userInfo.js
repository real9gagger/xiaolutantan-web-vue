export default {
    state(){
    	return {
    		authToken:  "", //令牌信息
            userName:   "", //账号
            nickName:   "", //昵称
            avatarUrl:  "", //头像URL
    	}
    },
    mutations: {
        SET_USER_INFO(state, payload){
            state.authToken = (payload?.authToken || "");
            state.userName  = (payload?.userName  || "");
            state.nickName  = (payload?.nickName  || "");
            state.avatarUrl = (payload?.avatarUrl || "");
        }
    },
    actions: {
        setUserInfo({ commit }, payload){
            commit("SET_USER_INFO", payload);
        }
    }
}