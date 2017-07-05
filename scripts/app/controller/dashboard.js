app
    .controller('DashboardController', function ($scope, RestService, $cookieStore, $mdDialog, $location) {
        $scope.items = [
            {
                header: 'سامانه‌های نگاشت',
                links: [
                    {title: 'نگاشت خصیصه', url: 'http://dmls.iust.ac.ir/mapping/html/property-mapping.html'},
                    {title: 'نگاشت الگو', url: 'http://dmls.iust.ac.ir/mapping/html/template-mapping.html'},
                    {title: 'سامانه نگاشت', url: 'http://dmls.iust.ac.ir/mapping/html/mappings.html'},
                ],
            },
            {
                header: 'سامانه‌های هستان‌شناسی',
                links: [
                    {title: 'ترجمه هستان‌شناسی', url: 'http://dmls.iust.ac.ir/mapping/html/index.html'},
                    {title: 'مدیریت هستان‌شناسی', url: ''},
                    {title: 'نمایش هستان‌شناسی ۱', url: 'http://dmls.iust.ac.ir/Ontology/1/'},
                    {title: 'نمایش هستان‌شناسی ۲', url: 'http://dmls.iust.ac.ir/Ontology/2/'},
                ],
            },
            {
                header: 'منابع گراف دانش',
                links: [
                    {title: 'نمایش منابع', url: 'http://dmls.iust.ac.ir/mapping/html/triples.html'}
                ],
            },
            {
                header: 'سامانه‌های جستجو',
                links: [
                    {title: 'جستجو', url: 'http://dmls.iust.ac.ir/search/html/index.html'},
                    {title: 'افزودن الگو', url: ''}
                ],
            },
            {
                header: 'گراف دانش',
                links: [
                    {title: 'مخزن سه‌تایی ویرتوسو', url: 'http://dmls.iust.ac.ir:8890/conductor/'},
                    {title: 'SPARQL', url: 'http://dmls.iust.ac.ir:8890/sparql'}
                ],
            },
            {
                header: 'سامانه‌های خبرگان',
                links: [
                    {title: 'نظارت سه‌تایی‌ها', url: 'http://dmls.iust.ac.ir/expert/'},
                    {title: 'مدیریت کاربران', url: 'http://dmls.iust.ac.ir/ui'},
                    {title: 'پنل ادمین', url: ''}
                ],
            },
            {
                header: 'سامانه‌های متن خام',
                links: [
                    {title: 'سامانه متن خام', url: 'http://dmls.iust.ac.ir/raw/'}
                ],
            }
        ];


    });
