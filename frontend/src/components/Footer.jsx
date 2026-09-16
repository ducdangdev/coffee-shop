import { Link } from 'react-router-dom';
import { AtSign, Coffee, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-coffee-950 text-cream-100">
      <div className="container-custom py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-800">
              <Coffee size={18} />
            </span>
            <span className="font-serif text-lg font-bold">Ô Cà Phê</span>
          </div>
          <p className="text-sm text-cream-100/70 leading-relaxed">
            Không gian ấm cúng, hương vị nguyên bản — nơi mỗi tách cà phê là một câu chuyện.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-cream-50">Liên kết</h4>
          <ul className="space-y-2 text-sm text-cream-100/70">
            <li><Link to="/menu" className="hover:text-gold-400 transition-colors">Thực đơn</Link></li>
            <li><Link to="/about" className="hover:text-gold-400 transition-colors">Giới thiệu</Link></li>
            <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Liên hệ</Link></li>
            <li><Link to="/admin/login" className="hover:text-gold-400 transition-colors">Đăng nhập Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-cream-50">Liên hệ</h4>
          <ul className="space-y-3 text-sm text-cream-100/70">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0" />
              <span>0901 234 567</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-cream-50">Kết nối</h4>
          <div className="flex gap-3">
            {[MessageCircle, AtSign, Send].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-800 transition-colors hover:bg-gold-500"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-coffee-800 py-5 text-center text-xs text-cream-100/50">
        © {new Date().getFullYear()} Ô Cà Phê. Đã đăng ký bản quyền.
      </div>
    </footer>
  );
}
