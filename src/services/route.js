import apiClient from './api'

export default {
    searchRoute(routeData){
        return apiClient.post('/routes/search', routeData)
    },

    searchSimpleRoute(originX, originY, destX, destY , originName=null, destName=null){
        const params = {
            originX,
            originY,
            destX,  
            destY,  
        };

        if (originName) {
            params.originName = originName;
        }

        if (destName) {
            params.destName = destName;
        }

        return apiClient.get('/routes/simple', { params });
    },

    searchMultiPointRoute(coordinates){
        return apiClient.post('/routes/multi-point', coordinates)
    },

    validateCoordinates(coordinates){
        return apiClient.post('/routes/validate', coordinates)
    },

    getRouteOptions(){
        return apiClient.get('/routes/options')
    },

    convertAttractionsToCoordinates(attractions) {
        return attractions.map(attraction => ({
            longitude: attraction.longitude,
            latitude: attraction.latitude,
            name: attraction.title
        }));
    },

    convertAttractionsToRouteRequest(attractions, options={}){
        if(!attractions || attractions.length < 2){
            throw new Error('최소 2개 이상의 관광지가 필요합니다.');
        }

        const coordinates = this.convertAttractionsToCoordinates(attractions);

        return {
            origin : coordinates[0],
            destination : coordinates[coordinates.length - 1],
            waypoints : coordinates.length > 2 ? coordinates.slice(1, -1 ) : null,
            priority : options.priority || 'RECOMMEND',
            carFuel : options.carFuel || 'GASOLINE',
            carHipass : options.carHipass || false,
            alternatives : options.alternatives || false,
            roadDetails: options.roadDetails !== false,
        };
    },

    getErrorMessage(error){
        if(error.response){
            const status = error.response.status;
            const message = error.response.data;
            
            switch(status){
                case 400:
                    if (typeof message === 'string' && message.includes('좌표')) {
                        return '좌표 정보가 올바르지 않습니다. 다시 확인해주세요.';
                    } else if (typeof message === 'string' && message.includes('경유지')) {
                        return '경유지는 최대 3개까지만 설정할 수 있습니다.';
                    }
                    return '요청 정보가 올바르지 않습니다.';
                case 404:
                    return '경로를 찾을 수 없습니다.';
                case 500:
                    return '서버에서 경로 계산 중 오류가 발생했습니다.';
                case 503:
                    return '경로 검색 서비스가 일시적으로 사용할 수 없습니다.';
                default:
                    return `경로 검색 중 오류가 발생했습니다. (${status})`;
            }
        } else if (error.request){
            return '네트워크 연결을 확인해주세요';
        }else{
            return '오류가 발생했습니다.' + error.message;
        }


    }





}
